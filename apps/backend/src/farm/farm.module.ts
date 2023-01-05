import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CollectionModule } from '../collection/collection.module';
import { NFTModule } from '../nft/nft.module';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';
import { HttpModule } from '@nestjs/axios';
import { VisitorModule } from '../visitor/visitor.module';
import { MiningFarmRepo } from './repos/mining-farm.repo';
import { EnergySourceRepo } from './repos/energy-source.repo';
import { ManufacturerRepo } from './repos/manufacturer.repo';
import { MinerRepo } from './repos/miner.repo';
import { DataModule } from '../data/data.module';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
    imports: [
        SequelizeModule.forFeature([
            MiningFarmRepo,
            EnergySourceRepo,
            MinerRepo,
            ManufacturerRepo,
        ]),
        forwardRef(() => NFTModule),
        forwardRef(() => CollectionModule),
        HttpModule,
        VisitorModule,
        DataModule,
        forwardRef(() => StatisticsModule),
    ],
    controllers: [FarmController],
    providers: [FarmService],
    exports: [FarmService],
})
export class FarmModule {}
