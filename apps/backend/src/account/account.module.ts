import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { CollectionRepo } from '../collection/repos/collection.repo';
import EmailService from '../email/email.service';
import { FarmService } from '../farm/farm.service';
import { EnergySource } from '../farm/models/energy-source.model';
import { Farm } from '../farm/models/farm.model';
import { Manufacturer } from '../farm/models/manufacturer.model';
import { Miner } from '../farm/models/miner.model';
import { NftRepo } from '../nft/repos/nft.repo';
import VisitorRepo from '../visitor/repo/visitor.repo';
import { VisitorService } from '../visitor/visitor.service';
import { AccountController } from './account.controller';
import AccountService from './account.service';
import AccountRepo from './repos/account.repo';
import AdminRepo from './repos/admin.repo';
import SuperAdminRepo from './repos/super-admin.repo';
import UserRepo from './repos/user.repo';

@Module({
    imports: [SequelizeModule.forFeature([VisitorRepo, AccountRepo, UserRepo, AdminRepo, SuperAdminRepo, Farm, CollectionRepo, NftRepo, Manufacturer, EnergySource, Miner]), HttpModule],
    providers: [AccountService, EmailService, JwtService, FarmService, VisitorService],
    exports: [AccountModule, AccountService],
    controllers: [AccountController],
})
export class AccountModule {}
