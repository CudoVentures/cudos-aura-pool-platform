import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FarmService } from '../farm/farm.service';
import { FarmModule } from '../farm/farm.module';
import { Farm } from '../farm/models/farm.model';
import { NFT } from '../nft/nft.model';
import { Manufacturer } from '../farm/models/manufacturer.model';
import { Miner } from '../farm/models/miner.model';
import { EnergySource } from '../farm/models/energy-source.model';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [SequelizeModule.forFeature([User, Farm, NFT, Manufacturer, Miner, EnergySource]), forwardRef(() => FarmModule), HttpModule],
    providers: [UserService, FarmService],
    controllers: [UserController],
    exports: [SequelizeModule],
})
export class UserModule {}
