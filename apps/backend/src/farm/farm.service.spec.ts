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
import { getGraphQlmarketplaceCollections, getGraphQlMarketplaceNftEvents } from '../../test/data/nft-events.data';
import { StatisticsModule } from '../statistics/statistics.module';

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

        jest.spyOn(graphQlService, 'fetchMarketplaceCollectionsByDenomIds').mockImplementation(async (denomIds) => getGraphQlmarketplaceCollections().filter((entity) => denomIds.includes(entity.denomId)));
        jest.spyOn(graphQlService, 'fetchMarketplaceNftTradeHistoryByDenomIds').mockImplementation(async (denomIds) => getGraphQlMarketplaceNftEvents().filter((entity) => denomIds.includes(entity.denomId)));
        jest.spyOn(graphQlService, 'fetchMarketplaceNftTradeHistoryByUniqueIds').mockImplementation(async (uniqIds) => getGraphQlMarketplaceNftEvents().filter((entity) => uniqIds.includes(`${entity.tokenId}@${entity.denomId}`)));
        jest.spyOn(graphQlService, 'fetchMarketplacePlatformNftTradeHistory').mockImplementation(async () => getGraphQlMarketplaceNftEvents());

    });

    afterAll(async () => {
        await module.close();

        await compose.down({
            cwd: testDbDockerPath,
        });
    });

    beforeEach(async () => {
        try {
            // await CollectionRepo.bulkCreate(collectionEntities.map((entity) => CollectionEntity.toRepo(entity).toJSON()));
            // await NftRepo.bulkCreate(nftTestEntitities.map((entity) => NftEntity.toRepo(entity).toJSON()));
        } catch (e) {
            console.log(e);
        }
    })

    afterEach(async () => {
        // await CollectionRepo.truncate({ cascade: true });
        // await NftRepo.truncate({ cascade: true });
    })

    it('should be defined', async () => {
        expect(service).toBeDefined();
    });

    it('should be defined', async () => {
        expect(service).toBeDefined();
    });
});
