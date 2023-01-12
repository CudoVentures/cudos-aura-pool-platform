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
    async editAccountPassByOldPass(accountEntity: AccountEntity, oldPass: string, newPass: string, tx: Transaction) {
        if (AccountService.isPassValid(accountEntity, oldPass) === false) {
            throw new WrongOldPasswordException();
        }

        accountEntity.salt = AccountService.generateSalt();
        accountEntity.hashedPass = AccountService.generateHashedPass(newPass, accountEntity.salt);
        await this.creditAccount(accountEntity, true, tx);
    }

    async editAccountPassByToken(encodedToken: string, newPass: string, tx: Transaction) {
        try {
            this.jwtService.verify(encodedToken, JwtToken.getConfig());
            const jwtToken = JwtToken.fromJson(this.jwtService.decode(encodedToken));
            const accountEntity = await this.findAccountById(jwtToken.id, tx, tx.LOCK.UPDATE);
            accountEntity.salt = AccountService.generateSalt();
            accountEntity.hashedPass = AccountService.generateHashedPass(newPass, accountEntity.salt);
            await this.creditAccount(accountEntity, true, tx);
        } catch (ex) {
            throw new WrongVerificationTokenException();
        }
    }

    async verifyEmailByToken(encodedToken: string, tx: Transaction) {
        try {
            this.jwtService.verify(encodedToken, JwtToken.getConfig());
            const jwtToken = JwtToken.fromJson(this.jwtService.decode(encodedToken));

            const accountEntity = await this.findAccountById(jwtToken.id, tx, tx.LOCK.UPDATE);
            accountEntity.markAsEmailVerified();
            await this.creditAccount(accountEntity, false, tx);
        } catch (ex) {
            throw new WrongVerificationTokenException();
        }
    }

    // db functions
    async findAccountById(accountId: number, tx: Transaction = undefined, lock: LOCK = undefined): Promise < AccountEntity | null > {
        const whereAccountRepo = new AccountRepo();
        whereAccountRepo.accountId = accountId;
        const accountRepo = await this.accountRepo.findOne({
            where: AppRepo.toJsonWhere(whereAccountRepo),
            transaction: tx,
            lock,
        });

        return AccountEntity.fromRepo(accountRepo);
    }

    async findAdminByAccountId(accountId: number, tx: Transaction = undefined, lock: LOCK = undefined): Promise < AdminEntity | null > {
        const whereAdminRepo = new AdminRepo();
        whereAdminRepo.accountId = accountId;
        const adminRepo = await this.adminRepo.findOne({
            where: AppRepo.toJsonWhere(whereAdminRepo),
            transaction: tx,
            lock,
        })

        return AdminEntity.fromRepo(adminRepo);
    }

    async findUserById(userId: number, tx: Transaction = undefined, lock: LOCK = undefined): Promise < UserEntity | null > {
        const whereUserRepo = new UserRepo();
        whereUserRepo.userId = userId;
        const userRepo = await this.userRepo.findOne({
            where: AppRepo.toJsonWhere(whereUserRepo),
            transaction: tx,
            lock,
        });

        return UserEntity.fromRepo(userRepo);
    }

    async findAccountByEmail(email: string, tx: Transaction = undefined, lock: LOCK = undefined): Promise < AccountEntity | null > {
        const whereAccountRepo = new AccountRepo();
        whereAccountRepo.email = email;

        const accountRepo = await this.accountRepo.findOne({
            where: AppRepo.toJsonWhere(whereAccountRepo),
            transaction: tx,
            lock,
        });

        return AccountEntity.fromRepo(accountRepo);
    }

    async findUserByCudosWalletAddress(cudosWalletAddress: string, tx: Transaction = undefined, lock: LOCK = undefined): Promise < UserEntity | null > {
        const whereUserRepo = new UserRepo();
        whereUserRepo.cudosWalletAddress = cudosWalletAddress;

        const userRepo = await this.userRepo.findOne({
            where: AppRepo.toJsonWhere(whereUserRepo),
            transaction: tx,
            lock,
        })

        return UserEntity.fromRepo(userRepo);
    }

    async findAccounts(accountId: number, tx: Transaction = undefined, lock: LOCK = undefined): Promise < { accountEntity: AccountEntity, userEntity: UserEntity, adminEntity: AdminEntity, superAdminEntity: SuperAdminEntity } > {
        const accountRepo = await this.accountRepo.findByPk(accountId, {
            transaction: tx,
            lock,
        });

        const whereUserRepo = new UserRepo();
        whereUserRepo.accountId = accountId;
        const userRepo = await this.userRepo.findOne({
            where: AppRepo.toJsonWhere(whereUserRepo),
            transaction: tx,
            lock,
        })

        const whereAdminRepo = new AdminRepo();
        whereAdminRepo.accountId = accountId;
        const adminRepo = await this.adminRepo.findOne({
            where: AppRepo.toJsonWhere(whereAdminRepo),
            transaction: tx,
            lock,
        })

        const whereSuperAdminRepo = new SuperAdminRepo();
        whereSuperAdminRepo.accountId = accountId;
        const superAdminRepo = await this.superAdminRepo.findOne({
            where: AppRepo.toJsonWhere(whereSuperAdminRepo),
            transaction: tx,
            lock,
        })

        return {
            accountEntity: AccountEntity.fromRepo(accountRepo),
            userEntity: UserEntity.fromRepo(userRepo),
            adminEntity: AdminEntity.fromRepo(adminRepo),
            superAdminEntity: SuperAdminEntity.fromRepo(superAdminRepo),
        }
    }

    async creditAccount(accountEntity: AccountEntity, includePassword = false, tx: Transaction = undefined): Promise < AccountEntity > {
        let accountRepo = AccountEntity.toRepo(accountEntity, includePassword);

        if (accountEntity.isNew() === true) {
            accountRepo = await this.accountRepo.create(accountRepo.toJSON(), {
                returning: true,
                transaction: tx,
            })
        } else {
            const whereAccountRepo = new AccountRepo();
            whereAccountRepo.accountId = accountRepo.accountId;
            accountRepo = await this.accountRepo.update(accountRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereAccountRepo),
                returning: true,
                transaction: tx,
            });
            accountRepo = accountRepo[1].length === 1 ? accountRepo[1][0] : null;
        }

        return AccountEntity.fromRepo(accountRepo);
    }

    async creditUser(userEntity: UserEntity, tx: Transaction = undefined): Promise < UserEntity > {
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
                    transaction: tx,
                })
            } else {
                const userRepoDb = await this.findUserById(userEntity.userId, tx, tx.LOCK.UPDATE);
                if (!userRepoDb) {
                    throw new NotFoundException();
                }
                oldUris = [userRepoDb.coverImgUrl, userRepoDb.profileImgUrl];

                const whereUserRepo = new UserRepo();
                whereUserRepo.userId = userRepo.userId;
                const sqlResult = await this.userRepo.update(userRepo.toJSON(), {
                    where: AppRepo.toJsonWhere(whereUserRepo),
                    returning: true,
                    transaction: tx,
                });
                userRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
            }
            this.dataService.cleanUpOldUris(oldUris, newUris);
        } catch (ex) {
            this.dataService.cleanUpNewUris(oldUris, newUris);
        }

        return UserEntity.fromRepo(userRepo);
    }

    async creditAdmin(adminEntity: AdminEntity, tx: Transaction = undefined): Promise < AdminEntity > {
        let adminRepo = AdminEntity.toRepo(adminEntity);
        if (adminEntity.isNew() === true) {
            adminRepo = await this.adminRepo.create(adminRepo.toJSON(), {
                returning: true,
                transaction: tx,
            })
        } else {
            const whereAdminRepo = new AdminRepo();
            whereAdminRepo.adminId = adminRepo.adminId;
            const sqlResult = await this.adminRepo.update(adminRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereAdminRepo),
                returning: true,
                transaction: tx,
            });
            adminRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return AdminEntity.fromRepo(adminRepo);
    }

    async creditSuperAdmin(superAdminEntity: SuperAdminEntity, tx: Transaction = undefined): Promise < SuperAdminEntity > {
        let superAdminRepo = SuperAdminEntity.toRepo(superAdminEntity);
        if (superAdminEntity.isNew() === true) {
            superAdminRepo = await this.superAdminRepo.create(superAdminRepo.toJSON(), {
                returning: true,
                transaction: tx,
            })
        } else {
            const whereSuperAdminRepo = new SuperAdminRepo();
            whereSuperAdminRepo.superAdminId = superAdminRepo.superAdminId;
            const sqlResult = await this.superAdminRepo.update(superAdminRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereSuperAdminRepo),
                returning: true,
                transaction: tx,
            });
            superAdminRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return SuperAdminEntity.fromRepo(superAdminRepo);
    }

}
