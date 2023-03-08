import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { GraphqlModule } from '../graphql/graphql.module';
import { NFTModule } from '../nft/nft.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.types';
import compose from 'docker-compose';
import Path from 'path';
import { CollectionRepo } from './repos/collection.repo';
import { CollectionService } from './collection.service';
import { AccountModule } from '../account/account.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { forwardRef } from '@nestjs/common';
import { NftRepo } from '../nft/repos/nft.repo';
import { getZeroDatePlusDaysTimestamp } from '../statistics/utils/test.utils';
import { collectionEntities } from '../../test/data/collections.data';
import { GraphqlService } from '../graphql/graphql.service';
import { getGraphQlMarketplaceNftEvents, getGraphQlNftNftEvents } from '../../test/data/nft-events.data';
import nftTestEntitities from '../../test/data/nft.data';
import { CollectionEntity } from './entities/collection.entity';
import NftEntity from '../nft/entities/nft.entity';
import { NOT_EXISTS_INT } from '../common/utils';
import { CoinGeckoModule } from '../coin-gecko/coin-gecko.module';

describe('CollectionService', () => {
    const testDbDockerPath = Path.join(process.cwd(), 'docker/test');
    let service: CollectionService;
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
                    CollectionRepo,
                ]),
                forwardRef(() => NFTModule),
                GraphqlModule,
                AccountModule,
                CoinGeckoModule,
                forwardRef(() => StatisticsModule),

            ],
            providers: [
                CollectionService,
            ],
        }).compile();

        await module.init();

        service = module.get<CollectionService>(CollectionService);
        graphQlService = module.get<GraphqlService>(GraphqlService);

        jest.spyOn(graphQlService, 'fetchNftTransferHistoryByUniqueIds').mockImplementation(async (uniqIds) => getGraphQlNftNftEvents().filter((entity) => uniqIds.includes(`${entity.tokenId}@${entity.denomId}`)));
        jest.spyOn(graphQlService, 'fetchNftPlatformTransferHistory').mockImplementation(async () => getGraphQlNftNftEvents());
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
            await CollectionRepo.bulkCreate(collectionEntities.map((entity) => CollectionEntity.toRepo(entity).toJSON()));
            await NftRepo.bulkCreate(nftTestEntitities.map((entity) => NftEntity.toRepo(entity).toJSON()));
        } catch (e) {
            console.log(e);
        }
    })

    afterEach(async () => {
        await CollectionRepo.truncate({ cascade: true });
        await NftRepo.truncate({ cascade: true });
    })

    it('should be defined', async () => {
        expect(service).toBeDefined();
    });

    // currently shows deleted as well
    it('fetchTopCollections: happy path', async () => {
        // Arrange
        const timestampFrom = getZeroDatePlusDaysTimestamp(0);
        const timestampTo = getZeroDatePlusDaysTimestamp(7);

        const topCollectionsData = collectionEntities.sort((a, b) => {
            return b.id - a.id
        });

        // Act
        const topCollectionsResult = await service.findTopCollections(timestampFrom, timestampTo);

        // db updates this on update and is hard to make it equal, so jsut bypass it
        topCollectionsResult.forEach((entity) => { entity.timestampUpdatedAt = NOT_EXISTS_INT });

        // Assert
        expect(topCollectionsResult).toEqual(topCollectionsData);
    })

    // currently shows deleted as well
    it('fetchTopCollections: timestamp restricted happy path', async () => {
        // Arrange
        const timestampFrom = getZeroDatePlusDaysTimestamp(4);
        const timestampTo = getZeroDatePlusDaysTimestamp(7);

        const topCollectionsData = collectionEntities.sort((a, b) => {
            return b.id - a.id
        }).slice(0, -3);

        // Act
        const topCollectionsResult = await service.findTopCollections(timestampFrom, timestampTo);

        // db updates this on update and is hard to make it equal, so jsut bypass it
        topCollectionsResult.forEach((entity) => { entity.timestampUpdatedAt = NOT_EXISTS_INT });

        // Assert
        expect(topCollectionsResult).toEqual(topCollectionsData);
    })

});
