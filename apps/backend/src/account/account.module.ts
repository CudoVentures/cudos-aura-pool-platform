import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { CollectionRepo } from '../collection/repos/collection.repo';
import EmailService from '../email/email.service';
import { FarmService } from '../farm/farm.service';
import { NftRepo } from '../nft/repos/nft.repo';
import { EnergySourceRepo } from '../farm/repos/energy-source.repo';
import { ManufacturerRepo } from '../farm/repos/manufacturer.repo';
import { MinerRepo } from '../farm/repos/miner.repo';
import { MiningFarmRepo } from '../farm/repos/mining-farm.repo';
import VisitorRepo from '../visitor/repo/visitor.repo';
import { VisitorService } from '../visitor/visitor.service';
import { AccountController } from './account.controller';
import AccountService from './account.service';
import AccountRepo from './repos/account.repo';
import AdminRepo from './repos/admin.repo';
import SuperAdminRepo from './repos/super-admin.repo';
import UserRepo from './repos/user.repo';
import DataService from '../data/data.service';
import { CollectionService } from '../collection/collection.service';
import { GraphqlService } from '../graphql/graphql.service';
import { NFTService } from '../nft/nft.service';
import { StatisticsService } from '../statistics/statistics.service';
import { NftPayoutHistory } from '../statistics/models/nft-payout-history.model';
import { NftOwnersPayoutHistory } from '../statistics/models/nft-owners-payout-history.model';
import { NftPayoutHistoryRepo } from '../statistics/repos/nft-payout-history.repo';
import { NftOwnersPayoutHistoryRepo } from '../statistics/repos/nft-owners-payout-history.repo';

@Module({
    imports: [SequelizeModule.forFeature([VisitorRepo, AccountRepo, UserRepo, AdminRepo, SuperAdminRepo, MiningFarmRepo, CollectionRepo, NftRepo, ManufacturerRepo, EnergySourceRepo, MinerRepo, NftPayoutHistory, NftPayoutHistoryRepo, NftOwnersPayoutHistory, NftOwnersPayoutHistoryRepo]), HttpModule],
    providers: [AccountService, EmailService, JwtService, FarmService, VisitorService, DataService, CollectionService, GraphqlService, NFTService, StatisticsService],
    exports: [AccountModule, AccountService, CollectionService],
    controllers: [AccountController],
})
export class AccountModule {}
