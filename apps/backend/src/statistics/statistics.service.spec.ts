import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { NftOwnersPayoutHistoryRepo } from './repos/nft-owners-payout-history.repo';
import { SequelizeModule } from '@nestjs/sequelize';
import { NftPayoutHistoryRepo } from './repos/nft-payout-history.repo';
import { GraphqlModule } from '../graphql/graphql.module';
import { NFTModule } from '../nft/nft.module';
import { FarmModule } from '../farm/farm.module';
import { CollectionModule } from '../collection/collection.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.types';
import { emptyStatisticsTestData, fillStatisticsTestData, getGraphQlmarketplaceCollections, getGraphQlMarketplaceNftEvents, getGraphQlNftNftEvents, getZeroDatePlusDaysTimestamp, nftTestEntitities } from './utils/test.utils';
import compose from 'docker-compose';
import Path from 'path';
import UserEarningsEntity from './entities/user-earnings.entity';
import NftEarningsEntity from './entities/nft-earnings.entity';
import MiningFarmEarningsEntity from './entities/mining-farm-earnings.entity';
import { GraphqlService } from '../graphql/graphql.service';
import UserEntity from '../account/entities/user.entity';
import NftEventFilterEntity from './entities/nft-event-filter.entity';
import { NftEventType } from '../../../frontend/src/features/analytics/entities/NftEventEntity';
import NftEventEntity, { NftTransferHistoryEventType } from './entities/nft-event.entity';
import { IntBoolValue } from '../common/utils';

describe('StatisticsService', () => {
    const testDbDockerPath = Path.join(process.cwd(), 'docker/test');
    let service: StatisticsService;
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
                    NftOwnersPayoutHistoryRepo,
                    NftPayoutHistoryRepo,
                ]),
                NFTModule,
                CollectionModule,
                FarmModule,
                GraphqlModule,
            ],
            providers: [
                StatisticsService,

            ],
        }).compile();

        await module.init();

        service = module.get<StatisticsService>(StatisticsService);
        graphQlService = module.get<GraphqlService>(GraphqlService);

        jest.spyOn(graphQlService, 'fetchMarketplaceCollectionsByDenomIds').mockImplementation(async (denomIds) => getGraphQlmarketplaceCollections().filter((entity) => denomIds.includes(entity.denomId)));
        jest.spyOn(graphQlService, 'fetchMarketplaceNftTradeHistoryByDenomIds').mockImplementation(async (denomIds) => getGraphQlMarketplaceNftEvents().filter((entity) => denomIds.includes(entity.denomId)));
        jest.spyOn(graphQlService, 'fetchNftTransferHistoryByUniqueIds').mockImplementation(async (uniqIds) => getGraphQlNftNftEvents().filter((entity) => uniqIds.includes(`${entity.tokenId}@${entity.denomId}`)));
        jest.spyOn(graphQlService, 'fetchMarketplaceNftTradeHistoryByUniqueIds').mockImplementation(async (uniqIds) => getGraphQlMarketplaceNftEvents().filter((entity) => uniqIds.includes(`${entity.tokenId}@${entity.denomId}`)));
    });

    afterAll(async () => {
        await module.close();

        await compose.down({
            cwd: testDbDockerPath,
        });
    });

    beforeEach(async () => {
        await fillStatisticsTestData();
    })

    afterEach(async () => {
        await emptyStatisticsTestData();
    })

    it('should be defined', async () => {
        expect(service).toBeDefined();
    });

    it('fetchPayoutHistoryByTokenId happy path', async () => {
        const expectedUserEraningsEntity = UserEarningsEntity.fromJson({
            totalEarningInBtc: '15',
            totalNftBought: 5,
            totalContractHashPowerInTh: 15,
            earningsPerDayInBtc: [
                '3',
                '4',
                '5',
            ],
            btcEarnedInBtc: '12',
        });

        const userEarningsEntity = await service.fetchEarningsByCudosAddress('testowner', getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4));

        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByNftId happy path', async () => {
        const expectedUserEraningsEntity = NftEarningsEntity.fromJson({
            earningsPerDayInBtc: ['3', '0', '0'],
        });

        const nftEarningsEntity = await service.fetchEarningsByNftId(nftTestEntitities[2].id, getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4));
        expect(nftEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByCudosAddress happy path', async () => {
        const expectedUserEraningsEntity = UserEarningsEntity.fromJson({
            totalEarningInBtc: '15',
            totalNftBought: 5,
            totalContractHashPowerInTh: 15,
            btcEarnedInBtc: '12',
            earningsPerDayInBtc: ['3', '4', '5'],
        });

        const userEarningsEntity = await service.fetchEarningsByCudosAddress('testowner', getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4));
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByMiningFarmId happy path', async () => {
        const expectedUserEraningsEntity = MiningFarmEarningsEntity.fromJson({
            totalMiningFarmSalesInAcudos: '6',
            totalMiningFarmRoyaltiesInAcudos: '0.6',
            totalNftSold: 3,
            maintenanceFeeDepositedInBtc: '6',
            earningsPerDayInAcudos: [
                '2.9', '0.3', '0',
            ],
        });

        const userEarningsEntity = await service.fetchEarningsByMiningFarmId(1, getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4));
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchNftEventsByFilter by session account happy path', async () => {
        // Arange
        const userEntity = UserEntity.fromJson({
            userId: '1',
            accountId: '1',
            cudosWalletAddress: 'testowner',
            bitcoinPayoutWalletAddress: 'payoutaddress',
            profileImgUrl: 'someuri',
            coverImgUrl: 'someuri',
        });

        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.count = 10;
        nftEventFilterEntity.eventTypes = [NftTransferHistoryEventType.MINT];
        nftEventFilterEntity.from = 0;
        nftEventFilterEntity.sessionAccount = IntBoolValue.TRUE;
        nftEventFilterEntity.timestampFrom = getZeroDatePlusDaysTimestamp(1);
        nftEventFilterEntity.timestampTo = getZeroDatePlusDaysTimestamp(3);

        const resultNftEntities = nftTestEntitities.filter((entity) => entity.currentOwner === userEntity.cudosWalletAddress);
        const resultNftEntitiesUniqIds = resultNftEntities.map((entity) => `${entity.tokenId}@${entity.denomId}`);
        const resultNftEventEntities = getGraphQlMarketplaceNftEvents()
            .filter((entity) => resultNftEntitiesUniqIds.includes(`${entity.tokenId}@${entity.denomId}`))
            .map((entity) => NftEventEntity.fromNftMarketplaceTradeHistory(entity))
            .filter((entity) => entity.isMintEvent() && entity.timestamp <= nftEventFilterEntity.timestampTo && entity.timestamp >= nftEventFilterEntity.timestampFrom)
        const total = 5;

        const result = { resultNftEventEntities, resultNftEntities, total };

        // Act
        const userEarningsEntity = await service.fetchNftEventsByFilter(userEntity, nftEventFilterEntity);

        // Assert
        expect(userEarningsEntity).toEqual(result);
    });
});
