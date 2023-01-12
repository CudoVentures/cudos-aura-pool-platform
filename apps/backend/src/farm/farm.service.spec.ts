import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { GraphqlModule } from '../graphql/graphql.module';
import { NFTModule } from '../nft/nft.module';
import { FarmModule } from './farm.module';
import { CollectionModule } from '../collection/collection.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.types';
import compose from 'docker-compose';
import Path from 'path';
import { GraphqlService } from '../graphql/graphql.service';
import { FarmService } from './farm.service';
import { HttpModule } from '@nestjs/axios';
import { VisitorModule } from '../visitor/visitor.module';
import { DataModule } from '../data/data.module';
import { MiningFarmRepo } from './repos/mining-farm.repo';
import { EnergySourceRepo } from './repos/energy-source.repo';
import { MinerRepo } from './repos/miner.repo';
import { ManufacturerRepo } from './repos/manufacturer.repo';
import { getGraphQlMarketplaceNftEvents, getGraphQlNftNftEvents } from '../../test/data/nft-events.data';
import { StatisticsModule } from '../statistics/statistics.module';
import { energySourceEntities, manufacturerEntities, minerEntities, miningFarmEntities } from '../../test/data/farm.data';
import ManufacturerEntity from './entities/manufacturer.entity';
import EnergySourceEntity from './entities/energy-source.entity';
import MinerEntity from './entities/miner.entity';
import MiningFarmEntity from './entities/mining-farm.entity';
import VisitorRepo from '../visitor/repo/visitor.repo';
import { visitorEntities } from '../../test/data/visitor.data';
import VisitorEntity from '../visitor/entities/visitor.entity';
import MiningFarmFilterModel, { MiningFarmOrderBy } from './dto/farm-filter.model';
import { FarmStatus } from './farm.types';
import { CollectionRepo } from '../collection/repos/collection.repo';
import { collectionEntities } from '../../test/data/collections.data';
import { CollectionEntity } from '../collection/entities/collection.entity';
import { NftRepo } from '../nft/repos/nft.repo';
import nftTestEntitities from '../../test/data/nft.data';
import { getZeroDatePlusDaysTimestamp } from '../statistics/utils/test.utils';
import NftEntity from '../nft/entities/nft.entity';
import MiningFarmPerformanceEntity from './entities/mining-farm-performance.entity';
import BigNumber from 'bignumber.js';

describe('FarmService', () => {
    const testDbDockerPath = Path.join(process.cwd(), 'docker/test');
    let service: FarmService;
    let module: TestingModule;
    let graphQlService: GraphqlService;

    jest.setTimeout(6000000);

    beforeAll(async () => {
        await compose.upAll({
            cwd: testDbDockerPath,
        });

        module = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    secret: jwtConstants.secret,
                    signOptions: { expiresIn: '7d' },
                }),
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: ['./config/.env'],
                    load: [() => {
                        const Config = {};
                        Object.keys(process.env).forEach((envName) => {
                            const envNameUppercase = envName.toUpperCase();
                            if (envNameUppercase.startsWith('APP_') === false) {
                                return;
                            }

                            Config[envNameUppercase] = process.env[envName];
                        });
                        return Config;
                    }],
                }),
                SequelizeModule.forRoot({
                    dialect: 'postgres',
                    host: 'host.docker.internal',
                    port: 15432,
                    username: 'postgres',
                    password: 'postgres',
                    database: 'aura_pool_test',
                    autoLoadModels: true,
                    synchronize: true,
                    logging: false,
                }),
                SequelizeModule.forFeature([
                    MiningFarmRepo,
                    EnergySourceRepo,
                    MinerRepo,
                    ManufacturerRepo,
                ]),
                NFTModule,
                CollectionModule,
                FarmModule,
                HttpModule,
                VisitorModule,
                DataModule,
                GraphqlModule,
                StatisticsModule,
            ],
            providers: [
                FarmService,
            ],
        }).compile();

        await module.init();

        service = module.get<FarmService>(FarmService);
        graphQlService = module.get<GraphqlService>(GraphqlService);

        jest.spyOn(graphQlService, 'fetchMarketplacePlatformNftTradeHistory').mockImplementation(async () => getGraphQlMarketplaceNftEvents());
        jest.spyOn(graphQlService, 'fetchNftPlatformTransferHistory').mockImplementation(async () => getGraphQlNftNftEvents());

    });

    afterAll(async () => {
        await module.close();

        await compose.down({
            cwd: testDbDockerPath,
        });
    });

    beforeEach(async () => {
        try {
            await ManufacturerRepo.bulkCreate(manufacturerEntities.map((entity) => ManufacturerEntity.toRepo(entity).toJSON()))
            await EnergySourceRepo.bulkCreate(energySourceEntities.map((entity) => EnergySourceEntity.toRepo(entity).toJSON()))
            await MinerRepo.bulkCreate(minerEntities.map((entity) => MinerEntity.toRepo(entity).toJSON()));
            await MiningFarmRepo.bulkCreate(miningFarmEntities.map((entity) => MiningFarmEntity.toRepo(entity).toJSON()));
            await VisitorRepo.bulkCreate(visitorEntities.map((entity) => VisitorEntity.toRepo(entity).toJSON()));
            await CollectionRepo.bulkCreate(collectionEntities.map((entity) => CollectionEntity.toRepo(entity).toJSON()));
            await NftRepo.bulkCreate(nftTestEntitities.map((entity) => NftEntity.toRepo(entity).toJSON()));
        } catch (e) {
            console.log(e);
        }
    })

    afterEach(async () => {
        await ManufacturerRepo.truncate({ cascade: true });
        await EnergySourceRepo.truncate({ cascade: true });
        await MinerRepo.truncate({ cascade: true });
        await MiningFarmRepo.truncate({ cascade: true });
        await VisitorRepo.truncate({ cascade: true });
        await CollectionRepo.truncate({ cascade: true });
        await NftRepo.truncate({ cascade: true });
    })

    it('should be defined', async () => {
        expect(service).toBeDefined();
        expect(graphQlService).toBeDefined();
    });

    it('findByFilter: popular farms happy path', async () => {
        // Arrange
        const status = FarmStatus.APPROVED;
        const popularFarmsExpected = miningFarmEntities
            .filter((entity) => entity.status === status)
            .sort((a, b) => b.id - a.id);

        const expectedObject = {
            miningFarmEntities: popularFarmsExpected,
            total: 3,
        }
        // Act
        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.from = 0;
        miningFarmFilterModel.count = 10;
        miningFarmFilterModel.orderBy = MiningFarmOrderBy.POPULAR_DESC;
        miningFarmFilterModel.status = [status];

        const popularFarmsResult = await service.findByFilter(null, miningFarmFilterModel);

        // Assert
        expect(popularFarmsResult).toEqual(expectedObject);
    });

    // doesn't include farms without any events
    it('findBestPerformingMiningFarms: happy path', async () => {
        // Arrange
        const timestampFrom = getZeroDatePlusDaysTimestamp(0);
        const timestampTo = getZeroDatePlusDaysTimestamp(5);

        const miningFarmEntitiesExpected = miningFarmEntities.slice(0, 3).sort((a, b) => b.id - a.id);
        const miningFarmPerformanceEntitiesExpected = miningFarmEntitiesExpected.map((entity) => MiningFarmPerformanceEntity.newInstanceForMiningFarm(entity.id))
        miningFarmPerformanceEntitiesExpected[0].floorPriceInAcudos = new BigNumber('600');
        miningFarmPerformanceEntitiesExpected[0].volumePer24HoursInAcudos = new BigNumber('340');
        miningFarmPerformanceEntitiesExpected[0].volumePer24HoursInUsd = 340;
        miningFarmPerformanceEntitiesExpected[1].floorPriceInAcudos = new BigNumber('400');
        miningFarmPerformanceEntitiesExpected[1].volumePer24HoursInAcudos = new BigNumber('100');
        miningFarmPerformanceEntitiesExpected[1].volumePer24HoursInUsd = 100;
        miningFarmPerformanceEntitiesExpected[2].floorPriceInAcudos = new BigNumber('100');
        miningFarmPerformanceEntitiesExpected[2].volumePer24HoursInAcudos = new BigNumber('40');
        miningFarmPerformanceEntitiesExpected[2].volumePer24HoursInUsd = 40;

        const expectedObject = {
            miningFarmEntities: miningFarmEntitiesExpected,
            miningFarmPerformanceEntities: miningFarmPerformanceEntitiesExpected,
        }

        // Act
        const bestPerformingFarmsResult = await service.findBestPerformingMiningFarms(timestampFrom, timestampTo);

        // Assert
        expect(bestPerformingFarmsResult).toEqual(expectedObject);
    });
});