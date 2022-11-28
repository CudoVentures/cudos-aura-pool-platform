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
    ) {}

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

    async findAccountById(accountId: number): Promise < AccountEntity | null > {
        const whereAccountRepo = new AccountRepo();
        whereAccountRepo.accountId = accountId;

        const accountRepo = await this.accountRepo.findOne({
            where: AppRepo.toJsonWhere(whereAccountRepo),
        });

        return AccountEntity.fromRepo(accountRepo);
    }

    async findAccountByEmail(email: string): Promise < AccountEntity | null > {
        const whereAccountRepo = new AccountRepo();
        whereAccountRepo.email = email;

        const accountRepo = await this.accountRepo.findOne({
            where: AppRepo.toJsonWhere(whereAccountRepo),
        });

        return AccountEntity.fromRepo(accountRepo);
    }

    async findUserByCudosWalletAddress(cudosWalletAddress: string): Promise < UserEntity | null > {
        const whereUserRepo = new UserRepo();
        whereUserRepo.cudosWalletAddress = cudosWalletAddress;

        const userRepo = await this.userRepo.findOne({
            where: AppRepo.toJsonWhere(whereUserRepo),
        })

        return UserEntity.fromRepo(userRepo);
    }

    async findAccounts(accountId: number): Promise < { accountEntity: AccountEntity, userEntity: UserEntity, adminEntity: AdminEntity, superAdminEntity: SuperAdminEntity } > {
        const accountRepo = await this.accountRepo.findByPk(accountId);

        const whereUserRepo = new UserRepo();
        whereUserRepo.accountId = accountId;
        const userRepo = await this.userRepo.findOne({
            where: AppRepo.toJsonWhere(whereUserRepo),
        })

        const whereAdminRepo = new AdminRepo();
        whereAdminRepo.accountId = accountId;
        const adminRepo = await this.adminRepo.findOne({
            where: AppRepo.toJsonWhere(whereAdminRepo),
        })

        const whereSuperAdminRepo = new SuperAdminRepo();
        whereSuperAdminRepo.accountId = accountId;
        const superAdminRepo = await this.superAdminRepo.findOne({
            where: AppRepo.toJsonWhere(whereSuperAdminRepo),
        })

        return {
            accountEntity: AccountEntity.fromRepo(accountRepo),
            userEntity: UserEntity.fromRepo(userRepo),
            adminEntity: AdminEntity.fromRepo(adminRepo),
            superAdminEntity: SuperAdminEntity.fromRepo(superAdminRepo),
        }
    }

    async creditAccount(accountEntity: AccountEntity): Promise < AccountEntity > {
        let accountRepo = AccountEntity.toRepo(accountEntity);
        if (accountEntity.isNew() === true) {
            accountRepo = await this.accountRepo.create(accountRepo.toJSON(), {
                returning: true,
            })
        } else {
            const whereAccountRepo = new AccountRepo();
            whereAccountRepo.accountId = accountRepo.accountId;
            accountRepo = await this.accountRepo.update(accountRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereAccountRepo),
            });
        }

        return AccountEntity.fromRepo(accountRepo);
    }

    async creditUser(userEntity: UserEntity): Promise < UserEntity > {
        let userRepo = UserEntity.toRepo(userEntity);
        if (userEntity.isNew() === true) {
            userRepo = await this.userRepo.create(userRepo.toJSON(), {
                returning: true,
            })
        } else {
            const whereUserRepo = new UserRepo();
            whereUserRepo.userId = userRepo.userId;
            userRepo = await this.userRepo.update(userRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereUserRepo),
            });
        }

        return UserEntity.fromRepo(userRepo);
    }

    async creditAdmin(adminEntity: AdminEntity): Promise < AdminEntity > {
        let adminRepo = AdminEntity.toRepo(adminEntity);
        if (adminEntity.isNew() === true) {
            adminRepo = await this.adminRepo.create(adminRepo.toJSON(), {
                returning: true,
            })
        } else {
            const whereAdminRepo = new AdminRepo();
            whereAdminRepo.adminId = adminRepo.adminId;
            adminRepo = await this.adminRepo.update(adminRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereAdminRepo),
            });
        }

        return AdminEntity.fromRepo(adminRepo);
    }

}
