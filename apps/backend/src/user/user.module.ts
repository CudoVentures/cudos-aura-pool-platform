import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtService } from '@nestjs/jwt';
import { FarmService } from '../farm/farm.service';
import { Farm } from '../farm/models/farm.model';
import { Collection } from '../collection/collection.model';
import { NFT } from '../nft/nft.model';
import { Manufacturer } from '../farm/models/manufacturer.model';
import { EnergySource } from '../farm/models/energy-source.model';
import { Miner } from '../farm/models/miner.model';
import { HttpModule } from '@nestjs/axios';
import { VisitorService } from '../visitor/visitor.service';
import VisitorRepo from '../visitor/visitor.repo';

@Module({
    imports: [HttpModule, SequelizeModule.forFeature([User, Farm, Collection, NFT, Manufacturer, EnergySource, Miner, VisitorRepo])],
    providers: [UserService, JwtService, FarmService, VisitorService],
    controllers: [UserController],
    exports: [SequelizeModule, UserService],
})
export class UserModule {}
