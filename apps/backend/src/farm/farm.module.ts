import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CollectionModule } from '../collection/collection.module';
import { CollectionService } from '../collection/collection.service';
import { NFTModule } from '../nft/nft.module';
import { NFTService } from '../nft/nft.service';
import { FarmController } from './farm.controller';
import { Farm } from './farm.model';
import { FarmService } from './farm.service';

@Module({
    imports: [SequelizeModule.forFeature([Farm]), CollectionModule, NFTModule],
    controllers: [FarmController],
    providers: [FarmService, CollectionService, NFTService],
})
export class FarmModule {}
