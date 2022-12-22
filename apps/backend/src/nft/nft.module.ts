import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NFTService } from './nft.service';
import { NFTController } from './nft.controller';
import { NftRepo } from './repos/nft.repo';
import { HttpModule } from '@nestjs/axios';
import { GraphqlModule } from '../graphql/graphql.module';
import { GraphqlService } from '../graphql/graphql.service';
import { CollectionService } from '../collection/collection.service';
import { CollectionModule } from '../collection/collection.module';
import { CollectionRepo } from '../collection/repos/collection.repo';
import { VisitorModule } from '../visitor/visitor.module';
import AccountService from '../account/account.service';
import AccountRepo from '../account/repos/account.repo';
import UserRepo from '../account/repos/user.repo';
import AdminRepo from '../account/repos/admin.repo';
import SuperAdminRepo from '../account/repos/super-admin.repo';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { StatisticsService } from '../statistics/statistics.service';
import { FarmService } from '../farm/farm.service';

@Module({
    imports: [
        SequelizeModule.forFeature([NftRepo, CollectionRepo, AccountRepo, UserRepo, AdminRepo, SuperAdminRepo]),
        HttpModule,
        GraphqlModule,
        VisitorModule,
        forwardRef(() => CollectionModule),
    ],
    providers: [NFTService, GraphqlService, CollectionService, AccountService, JwtService, FarmService, StatisticsService],
    controllers: [NFTController],
    exports: [SequelizeModule],
})
export class NFTModule {}
