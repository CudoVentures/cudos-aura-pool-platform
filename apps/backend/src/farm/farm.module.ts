import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CollectionModule } from '../collection/collection.module';
import { CollectionService } from '../collection/collection.service';
import { NFTModule } from '../nft/nft.module';
import { NFTService } from '../nft/nft.service';
import { FarmController } from './farm.controller';
import { Farm } from './models/farm.model';
import { FarmService } from './farm.service';
import { Miner } from './models/miner.model';
import { Manufacturer } from './models/manufacturer.model';
import { EnergySource } from './models/energy-source.model';

@Module({
    imports: [SequelizeModule.forFeature([Farm, Miner, Manufacturer, EnergySource]), forwardRef(() => CollectionModule), NFTModule],
    controllers: [FarmController],
    providers: [FarmService, CollectionService, NFTService],
})
export class FarmModule {}
