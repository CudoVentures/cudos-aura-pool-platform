import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccountController } from './account.controller';
import AccountService from './account.service';
import AccountRepo from './repos/account.repo';
import AdminRepo from './repos/admin.repo';
import SuperAdminRepo from './repos/super-admin.repo';
import UserRepo from './repos/user.repo';

@Module({
    imports: [SequelizeModule.forFeature([AccountRepo, UserRepo, AdminRepo, SuperAdminRepo])],
    providers: [AccountService],
    exports: [AccountModule, AccountService],
    controllers: [AccountController],
})
export class AccountModule {}
