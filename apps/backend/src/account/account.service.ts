import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import AccountEntity from './entities/account.entity';
import AccountRepo from './repos/account.repo';
import AdminRepo from './repos/admin.repo';
import SuperAdminRepo from './repos/super-admin.repo';
import UserRepo from './repos/user.repo';
import AppRepo from '../common/repo/app.repo';
import AdminEntity from './entities/admin.entity';
import SuperAdminEntity from './entities/super-admin.entity';
import UserEntity from './entities/user.entity';
import { LOCK, Transaction } from 'sequelize';
import { JwtService } from '@nestjs/jwt';
import JwtToken from '../auth/entities/jwt-token.entity';
import { DataServiceError, NotFoundException, WrongOldPasswordException, WrongVerificationTokenException } from '../common/errors/errors';
import DataService from '../data/data.service';

@Injectable()
export default class AccountService {

    constructor(
        @InjectModel(AccountRepo)
        private accountRepo: typeof AccountRepo,
        @InjectModel(UserRepo)
        private userRepo: typeof UserRepo,
        @InjectModel(AdminRepo)
        private adminRepo: typeof AdminRepo,
        @InjectModel(SuperAdminRepo)
        private superAdminRepo: typeof SuperAdminRepo,
        private jwtService: JwtService,
        private dataService: DataService,
    ) {}

    // utility functions
    static generateSalt() {
        return crypto.randomBytes(128).toString('base64');
    }

    static generateHashedPass(password: string, salt: string) {
        return crypto.createHmac('sha512', salt).update(password).digest('hex');
    }

    static isPassValid(accountEntity: AccountEntity, pass: string) {
        const hashedPass = AccountService.generateHashedPass(pass, accountEntity.salt);
        return hashedPass === accountEntity.hashedPass;
    }

    // controller functions
    async editAccountPassByOldPass(accountEntity: AccountEntity, oldPass: string, newPass: string, dbTx: Transaction) {
        if (AccountService.isPassValid(accountEntity, oldPass) === false) {
            throw new WrongOldPasswordException();
        }

        accountEntity.salt = AccountService.generateSalt();
        accountEntity.hashedPass = AccountService.generateHashedPass(newPass, accountEntity.salt);
        await this.creditAccount(accountEntity, true, dbTx);
    }

    async editAccountPassByToken(encodedToken: string, newPass: string, dbTx: Transaction) {
        try {
            this.jwtService.verify(encodedToken, JwtToken.getConfig());
            const jwtToken = JwtToken.fromJson(this.jwtService.decode(encodedToken));
            const accountEntity = await this.findAccountById(jwtToken.id, dbTx, dbTx.LOCK.UPDATE);
            accountEntity.salt = AccountService.generateSalt();
            accountEntity.hashedPass = AccountService.generateHashedPass(newPass, accountEntity.salt);
            await this.creditAccount(accountEntity, true, dbTx);
        } catch (ex) {
            throw new WrongVerificationTokenException();
        }
    }

    async verifyEmailByToken(encodedToken: string, dbTx: Transaction) {
        try {
            this.jwtService.verify(encodedToken, JwtToken.getConfig());
            const jwtToken = JwtToken.fromJson(this.jwtService.decode(encodedToken));

            const accountEntity = await this.findAccountById(jwtToken.id, dbTx, dbTx.LOCK.UPDATE);
            accountEntity.markAsEmailVerified();
            await this.creditAccount(accountEntity, false, dbTx);
        } catch (ex) {
            throw new WrongVerificationTokenException();
        }
    }

    // db functions
    async findAccountById(accountId: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < AccountEntity | null > {
        const whereAccountRepo = new AccountRepo();
        whereAccountRepo.accountId = accountId;
        const accountRepo = await this.accountRepo.findOne({
            where: AppRepo.toJsonWhere(whereAccountRepo),
            transaction: dbTx,
            lock: dbLock,
        });

        return AccountEntity.fromRepo(accountRepo);
    }

    async findAdminByAccountId(accountId: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < AdminEntity | null > {
        const whereAdminRepo = new AdminRepo();
        whereAdminRepo.accountId = accountId;
        const adminRepo = await this.adminRepo.findOne({
            where: AppRepo.toJsonWhere(whereAdminRepo),
            transaction: dbTx,
            lock: dbLock,
        })

        return AdminEntity.fromRepo(adminRepo);
    }

    async findUserById(userId: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < UserEntity | null > {
        const whereUserRepo = new UserRepo();
        whereUserRepo.userId = userId;
        const userRepo = await this.userRepo.findOne({
            where: AppRepo.toJsonWhere(whereUserRepo),
            transaction: dbTx,
            lock: dbLock,
        });

        return UserEntity.fromRepo(userRepo);
    }

    async findAccountByEmail(email: string, dbTx: Transaction, dbLock: LOCK = undefined): Promise < AccountEntity | null > {
        const whereAccountRepo = new AccountRepo();
        whereAccountRepo.email = email;

        const accountRepo = await this.accountRepo.findOne({
            where: AppRepo.toJsonWhere(whereAccountRepo),
            transaction: dbTx,
            lock: dbLock,
        });

        return AccountEntity.fromRepo(accountRepo);
    }

    async findUserByCudosWalletAddress(cudosWalletAddress: string, dbTx: Transaction, dbLock: LOCK = undefined): Promise < UserEntity | null > {
        const whereUserRepo = new UserRepo();
        whereUserRepo.cudosWalletAddress = cudosWalletAddress;

        const userRepo = await this.userRepo.findOne({
            where: AppRepo.toJsonWhere(whereUserRepo),
            transaction: dbTx,
            lock: dbLock,
        })

        return UserEntity.fromRepo(userRepo);
    }

    async findAccounts(accountId: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < { accountEntity: AccountEntity, userEntity: UserEntity, adminEntity: AdminEntity, superAdminEntity: SuperAdminEntity } > {
        const accountRepo = await this.accountRepo.findByPk(accountId, {
            transaction: dbTx,
            lock: dbLock,
        });

        const whereUserRepo = new UserRepo();
        whereUserRepo.accountId = accountId;
        const userRepo = await this.userRepo.findOne({
            where: AppRepo.toJsonWhere(whereUserRepo),
            transaction: dbTx,
            lock: dbLock,
        })

        const whereAdminRepo = new AdminRepo();
        whereAdminRepo.accountId = accountId;
        const adminRepo = await this.adminRepo.findOne({
            where: AppRepo.toJsonWhere(whereAdminRepo),
            transaction: dbTx,
            lock: dbLock,
        })

        const whereSuperAdminRepo = new SuperAdminRepo();
        whereSuperAdminRepo.accountId = accountId;
        const superAdminRepo = await this.superAdminRepo.findOne({
            where: AppRepo.toJsonWhere(whereSuperAdminRepo),
            transaction: dbTx,
            lock: dbLock,
        })

        return {
            accountEntity: AccountEntity.fromRepo(accountRepo),
            userEntity: UserEntity.fromRepo(userRepo),
            adminEntity: AdminEntity.fromRepo(adminRepo),
            superAdminEntity: SuperAdminEntity.fromRepo(superAdminRepo),
        }
    }

    async creditAccount(accountEntity: AccountEntity, includePassword: boolean, dbTx: Transaction): Promise < AccountEntity > {
        let accountRepo = AccountEntity.toRepo(accountEntity, includePassword);

        if (accountEntity.isNew() === true) {
            accountRepo = await this.accountRepo.create(accountRepo.toJSON(), {
                returning: true,
                transaction: dbTx,
            })
        } else {
            const whereAccountRepo = new AccountRepo();
            whereAccountRepo.accountId = accountRepo.accountId;
            accountRepo = await this.accountRepo.update(accountRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereAccountRepo),
                returning: true,
                transaction: dbTx,
            });
            accountRepo = accountRepo[1].length === 1 ? accountRepo[1][0] : null;
        }

        return AccountEntity.fromRepo(accountRepo);
    }

    async creditUser(userEntity: UserEntity, dbTx: Transaction): Promise < UserEntity > {
        let newUris = [], oldUris = [];

        try {
            userEntity.coverImgUrl = await this.dataService.trySaveUri(userEntity.accountId, userEntity.coverImgUrl);
            userEntity.profileImgUrl = await this.dataService.trySaveUri(userEntity.accountId, userEntity.profileImgUrl);
        } catch (e) {
            throw new DataServiceError();
        }
        newUris = [userEntity.coverImgUrl, userEntity.profileImgUrl];

        let userRepo = UserEntity.toRepo(userEntity);
        try {
            if (userEntity.isNew() === true) {
                userRepo = await this.userRepo.create(userRepo.toJSON(), {
                    returning: true,
                    transaction: dbTx,
                })
            } else {
                const userRepoDb = await this.findUserById(userEntity.userId, dbTx, dbTx.LOCK.UPDATE);
                if (!userRepoDb) {
                    throw new NotFoundException();
                }
                oldUris = [userRepoDb.coverImgUrl, userRepoDb.profileImgUrl];

                const whereUserRepo = new UserRepo();
                whereUserRepo.userId = userRepo.userId;
                const sqlResult = await this.userRepo.update(userRepo.toJSON(), {
                    where: AppRepo.toJsonWhere(whereUserRepo),
                    returning: true,
                    transaction: dbTx,
                });
                userRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
            }
            this.dataService.cleanUpOldUris(oldUris, newUris);
        } catch (ex) {
            this.dataService.cleanUpNewUris(oldUris, newUris);
        }

        return UserEntity.fromRepo(userRepo);
    }

    async creditAdmin(adminEntity: AdminEntity, dbTx: Transaction): Promise < AdminEntity > {
        let adminRepo = AdminEntity.toRepo(adminEntity);
        if (adminEntity.isNew() === true) {
            adminRepo = await this.adminRepo.create(adminRepo.toJSON(), {
                returning: true,
                transaction: dbTx,
            })
        } else {
            const whereAdminRepo = new AdminRepo();
            whereAdminRepo.adminId = adminRepo.adminId;
            const sqlResult = await this.adminRepo.update(adminRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereAdminRepo),
                returning: true,
                transaction: dbTx,
            });
            adminRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return AdminEntity.fromRepo(adminRepo);
    }

    async creditSuperAdmin(superAdminEntity: SuperAdminEntity, dbTx: Transaction): Promise < SuperAdminEntity > {
        let superAdminRepo = SuperAdminEntity.toRepo(superAdminEntity);
        if (superAdminEntity.isNew() === true) {
            superAdminRepo = await this.superAdminRepo.create(superAdminRepo.toJSON(), {
                returning: true,
                transaction: dbTx,
            })
        } else {
            const whereSuperAdminRepo = new SuperAdminRepo();
            whereSuperAdminRepo.superAdminId = superAdminRepo.superAdminId;
            const sqlResult = await this.superAdminRepo.update(superAdminRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereSuperAdminRepo),
                returning: true,
                transaction: dbTx,
            });
            superAdminRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return SuperAdminEntity.fromRepo(superAdminRepo);
    }

}
