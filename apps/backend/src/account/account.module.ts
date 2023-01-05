import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccountController } from './account.controller';
import AccountService from './account.service';
import AccountRepo from './repos/account.repo';
import AdminRepo from './repos/admin.repo';
import SuperAdminRepo from './repos/super-admin.repo';
import UserRepo from './repos/user.repo';
import { DataModule } from '../data/data.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [
        SequelizeModule.forFeature([
            AccountRepo,
            UserRepo,
            AdminRepo,
            SuperAdminRepo,
        ]),
        JwtModule,
        DataModule,
        EmailModule,
    ],
    providers: [AccountService],
    controllers: [AccountController],
    exports: [AccountService],
})
export class AccountModule {}
