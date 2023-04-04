import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { NftOwnersPayoutHistoryRepo } from './repos/nft-owners-payout-history.repo';
import { SequelizeModule } from '@nestjs/sequelize';
import { NftPayoutHistoryRepo } from './repos/nft-payout-history.repo';
import { GraphqlModule } from '../graphql/graphql.module';
import { NFTModule } from '../nft/nft.module';
import { FarmModule } from '../farm/farm.module';
import { CollectionModule } from '../collection/collection.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.types';
import { emptyStatisticsTestData, fillStatisticsTestData, getGraphQlmarketplaceCollections, getGraphQlMarketplaceNftEvents, getGraphQlNftNftEvents, getZeroDatePlusDaysTimestamp, nftTestEntitities } from './utils/test.utils';
import compose from 'docker-compose';
import Path from 'path';
import UserEarningsEntity from './entities/user-earnings.entity';
import NftEarningsEntity from './entities/nft-earnings.entity';
import { GraphqlService } from '../graphql/graphql.service';
import UserEntity from '../account/entities/user.entity';
import NftEventFilterEntity from './entities/nft-event-filter.entity';
import NftEventEntity, { NftTransferHistoryEventType } from './entities/nft-event.entity';
import { IntBoolValue } from '../common/utils';
import { NftRepo } from '../nft/repos/nft.repo';
import { v4 as uuidv4 } from 'uuid';
import { NftStatus } from '../nft/nft.types';
import NftEntity from '../nft/entities/nft.entity';
import { DataServiceError } from '../common/errors/errors';
import { collectionEntities } from '../../test/data/collections.data';
import EarningsEntity from './entities/platform-earnings.entity';
import EarningsPerDayFilterEntity, { EarningsPerDayCurrency } from './entities/earnings-per-day-filter.entity';
import MegaWalletEventFilterEntity from './entities/mega-wallet-event-filter.entity';
import { AddressesPayoutHistoryRepo } from './repos/addresses-payout-history.repo';
import { CollectionPaymentAllocationRepo } from './repos/collection-payment-allocation.repo';
import MegaWalletEventEntity from './entities/mega-wallet-event.entity';
import { miningFarmEntities } from '../../test/data/farm.data';
import MiningFarmEntity from '../farm/entities/mining-farm.entity';
import { CollectionEntity } from '../collection/entities/collection.entity';

describe('StatisticsService', () => {
    const testDbDockerPath = Path.join(process.cwd(), 'docker/test');
    let service: StatisticsService;
    let module: TestingModule;
    let graphQlService: GraphqlService;
    let configService: ConfigService;

    jest.setTimeout(6000000);

    beforeAll(async () => {
        await compose.upAll({
            cwd: testDbDockerPath,
        });

        module = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    secret: jwtConstants.secret,
                    signOptions: { expiresIn: '20m' },
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
                    AddressesPayoutHistoryRepo,
                    CollectionPaymentAllocationRepo,
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
        configService = module.get<ConfigService>(ConfigService);

        jest.spyOn(graphQlService, 'fetchMarketplaceCollectionsByDenomIds').mockImplementation(async (denomIds) => getGraphQlmarketplaceCollections().filter((entity) => denomIds.includes(entity.denomId)));
        jest.spyOn(graphQlService, 'fetchMarketplaceNftTradeHistoryByDenomIds').mockImplementation(async (denomIds) => getGraphQlMarketplaceNftEvents().filter((entity) => denomIds.includes(entity.denomId)));
        jest.spyOn(graphQlService, 'fetchNftTransferHistoryByUniqueIds').mockImplementation(async (uniqIds) => getGraphQlNftNftEvents().filter((entity) => uniqIds.includes(`${entity.tokenId}@${entity.denomId}`)));
        jest.spyOn(graphQlService, 'fetchNftTransferHistoryByUniqueIdsAndTimestamp').mockImplementation(async (timestampFrom, timestampTo, uniqIds) => getGraphQlNftNftEvents().filter((entity) => uniqIds.includes(`${entity.tokenId}@${entity.denomId}`)
            && entity.timestamp >= timestampFrom
            && entity.timestamp <= timestampTo));
        jest.spyOn(graphQlService, 'fetchMarketplaceNftTradeHistoryByUniqueIds').mockImplementation(async (uniqIds) => getGraphQlMarketplaceNftEvents().filter((entity) => uniqIds.includes(`${entity.tokenId}@${entity.denomId}`)));
        jest.spyOn(graphQlService, 'fetchMarketplaceNftTradeHistoryByUniqueIdsAndTimestamp').mockImplementation(async (timestampFrom, timestampTo, uniqIds) => getGraphQlMarketplaceNftEvents().filter((entity) => uniqIds.includes(`${entity.tokenId}@${entity.denomId}`)
            && entity.timestamp >= timestampFrom
            && entity.timestamp <= timestampTo));
        jest.spyOn(graphQlService, 'fetchNftTransferHistoryByUniqueIds').mockImplementation(async (uniqIds) => getGraphQlNftNftEvents().filter((entity) => uniqIds.includes(`${entity.tokenId}@${entity.denomId}`)));
        jest.spyOn(graphQlService, 'fetchNftTransferHistoryByDenomIds').mockImplementation(async (denomIds) => getGraphQlNftNftEvents().filter((entity) => denomIds.includes(entity.denomId)));
        jest.spyOn(graphQlService, 'fetchMarketplaceNftTradeHistoryByDenomIds').mockImplementation(async (denomIds) => getGraphQlMarketplaceNftEvents().filter((entity) => denomIds.includes(entity.denomId)));

        jest.spyOn(graphQlService, 'fetchNftTransferHistoryByAddressAndTimestamp').mockImplementation(async (timestampFrom, timestampTo, address) => getGraphQlNftNftEvents().filter((entity) => (entity.newOwner === address
            || entity.oldOwner === address)
            && entity.timestamp >= timestampFrom
            && entity.timestamp <= timestampTo));

        jest.spyOn(graphQlService, 'fetchMarketplaceNftTradeHistoryByAddressAndTimestamp').mockImplementation(async (timestampFrom, timestampTo, address) => getGraphQlMarketplaceNftEvents().filter((entity) => (entity.buyer === address
            || entity.seller === address)
            && entity.timestamp >= timestampFrom
            && entity.timestamp <= timestampTo));

        jest.spyOn(configService, 'getOrThrow').mockImplementation(() => 'testpayout');
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

    it('Should be defined', async () => {
        expect(service).toBeDefined();
    });

    it('All: bad timeframe should throw error', async () => {
        // Arrange
        const timestampFrom = 10;
        const timestampTo = 1;

        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.timestampFrom = timestampFrom;
        nftEventFilterEntity.timestampTo = timestampTo;

        // Assert
        expect(() => service.fetchEarningsByCudosAddress('testowner', timestampFrom, timestampTo, undefined)).rejects.toThrow(DataServiceError);
        expect(() => service.fetchEarningsByNftId(uuidv4(), timestampFrom, timestampTo, undefined)).rejects.toThrow(DataServiceError);
        expect(() => service.fetchNftEventsByFilter(null, nftEventFilterEntity, undefined)).rejects.toThrow(DataServiceError);
    });

    it('fetchEarningsByCudosAddress: Happy path', async () => {
        const expectedUserEraningsEntity = UserEarningsEntity.fromJson({
            totalEarningInBtc: '15',
            totalNftBought: 5,
            totalContractHashPowerInTh: 15,
            btcEarnedInBtc: '12',
            earningsPerDayInBtc: ['3', '4', '5'],
        });

        const userEarningsEntity = await service.fetchEarningsByCudosAddress('testowner', getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4), undefined);
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByCudosAddress: Not owned, expired and removed NFTs', async () => {
        // adding data to db that shouldn't be calculated
        await NftRepo.create({ // not owned
            id: uuidv4(), name: 'nftX', uri: 'someuri', data: 'somestring', artistName: 'artist name of the nft', hashingPower: 1, price: '231400', expirationDate: new Date(2024, 10, 10), status: NftStatus.MINTED, tokenId: 10, collectionId: 1, creatorId: 1, deletedAt: null, currentOwner: 'testowner2', marketplaceNftId: 10,
        });
        await NftRepo.create({ // owned but expired
            id: uuidv4(), name: 'nftX2', uri: 'someuri', data: 'somestring', artistName: 'artist name of the nft', hashingPower: 1, price: '1231400', expirationDate: new Date(0), status: NftStatus.MINTED, tokenId: 11, collectionId: 1, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 10,
        });
        await NftRepo.create({ // owned but expired
            id: uuidv4(), name: 'nftX3', uri: 'someuri', data: 'somestring', artistName: 'artist name of the nft', hashingPower: 1, price: '21231400', expirationDate: new Date(2024, 9, 9), status: NftStatus.REMOVED, tokenId: 12, collectionId: 1, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 10,
        });

        const expectedUserEraningsEntity = UserEarningsEntity.fromJson({
            totalEarningInBtc: '15',
            totalNftBought: 5,
            totalContractHashPowerInTh: 15,
            btcEarnedInBtc: '12',
            earningsPerDayInBtc: ['3', '4', '5'],
        });

        const userEarningsEntity = await service.fetchEarningsByCudosAddress('testowner', getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4), undefined);
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByCudosAddress: BigNumber calculations and not sent payouts', async () => {
        // adding data to db that shouldn't be calculated
        await NftRepo.create({ // not owned
            id: uuidv4(), name: 'nftX', uri: 'someuri', data: 'somestring', artistName: 'artist name of the nft', hashingPower: 1, price: '123412312490071992547409919007199254740991.90071992547409919007199254740991', expirationDate: new Date(2024, 10, 10), status: NftStatus.MINTED, tokenId: 'onchain_token', collectionId: 1, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 10,
        });
        await NftPayoutHistoryRepo.create({
            id: 10, token_id: 10, denom_id: `testdenomid${10}`, payout_period_start: getZeroDatePlusDaysTimestamp(0), payout_period_end: getZeroDatePlusDaysTimestamp(5), reward: '190071992547409919007199254740991.90071992547409919007199254740991', tx_hash: 'txhash10', maintenance_fee: 10, cudo_part_of_maintenance_fee: 10, createdAt: new Date(getZeroDatePlusDaysTimestamp(9)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(9)),
        })
        await NftOwnersPayoutHistoryRepo.create({
            id: 10, time_owned_from: 10, time_owned_to: 10, total_time_owned: 10, percent_of_time_owned: 10, owner: 'testowner', payout_address: 'testpayout', reward: '90071992547409919007199254740991.90071992547409919007199254740991', nft_payout_history_id: 10, createdAt: new Date(getZeroDatePlusDaysTimestamp(9)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(9)), sent: true,
        });
        await NftOwnersPayoutHistoryRepo.create({
            id: 11, time_owned_from: 11, time_owned_to: 11, total_time_owned: 11, percent_of_time_owned: 11, owner: 'testowner', payout_address: 'testpayout', reward: '0.00000000000000000000000000000000000000001', nft_payout_history_id: 10, createdAt: new Date(getZeroDatePlusDaysTimestamp(9)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(9)), sent: true,
        });
        await NftOwnersPayoutHistoryRepo.create({
            id: 12, time_owned_from: 12, time_owned_to: 12, total_time_owned: 12, percent_of_time_owned: 12, owner: 'testowner', payout_address: 'testpayout', reward: '0.00000000000000000000000000000000000000002', nft_payout_history_id: 10, createdAt: new Date(getZeroDatePlusDaysTimestamp(10)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(10)), sent: true,
        });
        await NftOwnersPayoutHistoryRepo.create({
            id: 13, time_owned_from: 13, time_owned_to: 13, total_time_owned: 13, percent_of_time_owned: 13, owner: 'testowner', payout_address: 'testpayout', reward: '0.00000000000000000000000000000000000000003', nft_payout_history_id: 10, createdAt: new Date(getZeroDatePlusDaysTimestamp(10)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(10)), sent: false,
        });

        const expectedUserEraningsEntity = UserEarningsEntity.fromJson({
            totalEarningInBtc: '90071992547409919007199254741006.90071992547409919007199254740991000000003',
            totalNftBought: 6,
            totalContractHashPowerInTh: 16,
            btcEarnedInBtc: '90071992547409919007199254741003.90071992547409919007199254740991000000003',
            earningsPerDayInBtc: ['3', '4', '5', '0', '0', '0', '0', '90071992547409919007199254740991.90071992547409919007199254740991000000001', '0.00000000000000000000000000000000000000002'],
        });

        const userEarningsEntity = await service.fetchEarningsByCudosAddress('testowner', getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(10), undefined);
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByNftId: Happy path', async () => {
        const expectedUserEraningsEntity = NftEarningsEntity.fromJson({
            earningsPerDayInBtc: ['3', '0', '0'],
        });

        const nftEarningsEntity = await service.fetchEarningsByNftId(nftTestEntitities[2].id, getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4), undefined);
        expect(nftEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByNftId: Queued NFTs', async () => {
        const id = uuidv4();
        await NftRepo.create({ // not owned
            id, name: 'nftX', uri: 'someuri', data: 'somestring', artistName: 'artist name of the nft', hashingPower: 1, price: '1.2', expirationDate: new Date(2024, 10, 10), status: NftStatus.QUEUED, tokenId: 10, collectionId: 1, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 10,
        });
        await NftPayoutHistoryRepo.create({
            id: 10, token_id: 10, denom_id: `testdenomid${10}`, payout_period_start: getZeroDatePlusDaysTimestamp(0), payout_period_end: getZeroDatePlusDaysTimestamp(5), reward: '190071992547409919007199254740991.90071992547409919007199254740991', tx_hash: 'txhash10', maintenance_fee: 10, cudo_part_of_maintenance_fee: 10, createdAt: new Date(getZeroDatePlusDaysTimestamp(3)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(3)),
        })
        await NftOwnersPayoutHistoryRepo.create({
            id: 10, time_owned_from: 10, time_owned_to: 10, total_time_owned: 10, percent_of_time_owned: 10, owner: 'testowner', payout_address: 'testpayout', reward: '90071992547409919007199254740991.90071992547409919007199254740991', nft_payout_history_id: 10, createdAt: new Date(getZeroDatePlusDaysTimestamp(3)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(3)), sent: true,
        });

        const expectedUserEraningsEntity = NftEarningsEntity.fromJson({
            earningsPerDayInBtc: ['0', '0', '0'],
        });

        const nftEarningsEntity = await service.fetchEarningsByNftId(id, getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4), undefined);
        expect(nftEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByNftId: Removed NFTs', async () => {
        // Arrange
        const id = uuidv4();
        await NftRepo.create({ // not owned
            id, name: 'nftX', uri: 'someuri', data: 'somestring', artistName: 'artist name of the nft', hashingPower: 1, price: '1.2', expirationDate: new Date(2024, 10, 10), status: NftStatus.REMOVED, tokenId: 10, collectionId: 1, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 10,
        });
        await NftPayoutHistoryRepo.create({
            id: 10, token_id: 10, denom_id: `testdenomid${10}`, payout_period_start: getZeroDatePlusDaysTimestamp(0), payout_period_end: getZeroDatePlusDaysTimestamp(5), reward: '190071992547409919007199254740991.90071992547409919007199254740991', tx_hash: 'txhash10', maintenance_fee: 10, cudo_part_of_maintenance_fee: 10, createdAt: new Date(getZeroDatePlusDaysTimestamp(3)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(3)),
        })
        await NftOwnersPayoutHistoryRepo.create({
            id: 10, time_owned_from: 10, time_owned_to: 10, total_time_owned: 10, percent_of_time_owned: 10, owner: 'testowner', payout_address: 'testpayout', reward: '90071992547409919007199254740991.90071992547409919007199254740991', nft_payout_history_id: 10, createdAt: new Date(getZeroDatePlusDaysTimestamp(3)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(3)), sent: true,
        });

        const expectedUserEraningsEntity = NftEarningsEntity.fromJson({
            earningsPerDayInBtc: ['0', '0', '0'],
        });

        // Act
        const nftEarningsEntity = await service.fetchEarningsByNftId(id, getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4), undefined);

        // Assert
        expect(nftEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchNftEventsByFilter: Minted by session account', async () => {
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

        const collectionIdCollectionMap = new Map<number, CollectionEntity>();
        collectionEntities.forEach((collectionEntity: CollectionEntity) => {
            collectionIdCollectionMap.set(collectionEntity.id, collectionEntity);
        })

        const denomIdTokenIdNftEntityMap = new Map<string, Map<string, NftEntity>>();
        nftTestEntitities.forEach((nftEntity: NftEntity) => {
            const collectionEntity = collectionIdCollectionMap.get(nftEntity.collectionId);
            if (denomIdTokenIdNftEntityMap.has(collectionEntity.denomId) === false) {
                denomIdTokenIdNftEntityMap.set(collectionEntity.denomId, new Map());
            }

            const tempMap = denomIdTokenIdNftEntityMap.get(collectionEntity.denomId);

            tempMap.set(nftEntity.tokenId, nftEntity);
        });

        const nftEventEntities = getGraphQlMarketplaceNftEvents().map((entity) => NftEventEntity.fromNftMarketplaceTradeHistory(entity))
            .concat(getGraphQlNftNftEvents().map((entity) => NftEventEntity.fromNftModuleTransferHistory(entity)))
            .filter((entity) => {
                return (entity.fromAddress === userEntity.cudosWalletAddress || entity.toAddress === userEntity.cudosWalletAddress)
                && entity.isMintEvent()
                && entity.timestamp <= nftEventFilterEntity.timestampTo
                && entity.timestamp >= nftEventFilterEntity.timestampFrom;
            })
            .sort((a, b) => b.timestamp - a.timestamp);

        let nftEntities = [];
        nftEventEntities.forEach((entity) => {
            const nft = denomIdTokenIdNftEntityMap.get(entity.denomId).get(entity.tokenId);
            entity.nftId = nft.id;

            nftEntities.push(nft);
        })

        nftEntities = nftEntities.filter((entity, index) => nftEntities.findIndex((entity2) => entity2.id === entity.id) === index);

        const total = nftEventEntities.length;

        const result = { nftEventEntities, nftEntities, total };

        // Act
        const userEarningsEntity = await service.fetchNftEventsByFilter(userEntity, nftEventFilterEntity, undefined);

        // Assert
        expect(userEarningsEntity.total).toEqual(result.total);
        expect(userEarningsEntity.nftEventEntities).toEqual(result.nftEventEntities);
        expect(userEarningsEntity.nftEntities.sort((a, b) => a.id.localeCompare(b.id))).toEqual(result.nftEntities.sort((a, b) => a.id.localeCompare(b.id)));
    });

    it('fetchNftEventsByFilter: Sales only', async () => {
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
        nftEventFilterEntity.eventTypes = [NftTransferHistoryEventType.SALE];
        nftEventFilterEntity.from = 0;
        nftEventFilterEntity.sessionAccount = IntBoolValue.FALSE;
        nftEventFilterEntity.timestampFrom = getZeroDatePlusDaysTimestamp(1);
        nftEventFilterEntity.timestampTo = getZeroDatePlusDaysTimestamp(3);

        let nftEntities = nftTestEntitities;
        const resultNftEntitiesUniqIds = nftEntities.map((entity) => {
            const collection = collectionEntities.find((collectionEntity) => collectionEntity.id === entity.collectionId);
            return `${entity.tokenId}@${collection.denomId}`;
        });
        const nftEventEntities = getGraphQlMarketplaceNftEvents()
            .filter((entity) => resultNftEntitiesUniqIds.includes(`${entity.tokenId}@${entity.denomId}`))
            .map((entity) => {
                const nftEventEntity = NftEventEntity.fromNftMarketplaceTradeHistory(entity);
                const collection = collectionEntities.find((collectionEntity) => collectionEntity.denomId === nftEventEntity.denomId)
                const nft = nftEntities.find((nftEntity) => nftEntity.tokenId === nftEventEntity.tokenId && nftEntity.collectionId === collection.id);

                nftEventEntity.nftId = nft.id;
                return nftEventEntity;
            })
            .filter((entity) => {
                return entity.isSaleEvent() && entity.timestamp <= nftEventFilterEntity.timestampTo && entity.timestamp >= nftEventFilterEntity.timestampFrom;
            })
            .sort((a, b) => b.timestamp - a.timestamp);

        const nftEventMap = new Map<string, NftEventEntity>();
        nftEventEntities.forEach((entity) => nftEventMap.set(entity.nftId, entity));

        const total = nftEventEntities.length;
        nftEntities = nftEntities.filter((entity) => nftEventMap.get(entity.id));

        const result = { nftEventEntities, nftEntities, total };

        // Act
        const userEarningsEntity = await service.fetchNftEventsByFilter(userEntity, nftEventFilterEntity, undefined);

        // Assert
        expect(userEarningsEntity.total).toEqual(result.total);
        expect(userEarningsEntity.nftEventEntities).toEqual(result.nftEventEntities);
        expect(userEarningsEntity.nftEntities.sort((a, b) => a.id.localeCompare(b.id))).toEqual(result.nftEntities.sort((a, b) => a.id.localeCompare(b.id)));
    });

    it('fetchNftEventsByFilter: By platform minted', async () => {
        // Arange
        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.count = 10;
        nftEventFilterEntity.eventTypes = [NftTransferHistoryEventType.MINT];
        nftEventFilterEntity.from = 0;
        nftEventFilterEntity.timestampFrom = getZeroDatePlusDaysTimestamp(1);
        nftEventFilterEntity.timestampTo = getZeroDatePlusDaysTimestamp(3);

        let nftEntities = nftTestEntitities;

        const resultNftEntitiesUniqIds = nftEntities.map((entity) => {
            const collection = collectionEntities.find((collectionEntity) => collectionEntity.id === entity.collectionId);
            return `${entity.tokenId}@${collection.denomId}`;
        });

        const nftEventEntities = getGraphQlMarketplaceNftEvents()
            .filter((entity) => resultNftEntitiesUniqIds.includes(`${entity.tokenId}@${entity.denomId}`))
            .map((entity) => {
                const nftEventEntity = NftEventEntity.fromNftMarketplaceTradeHistory(entity);
                const collection = collectionEntities.find((collectionEntity) => collectionEntity.denomId === nftEventEntity.denomId)
                const nft = nftEntities.find((nftEntity) => nftEntity.tokenId === nftEventEntity.tokenId && nftEntity.collectionId === collection.id);

                nftEventEntity.nftId = nft.id;
                return nftEventEntity;
            })
            .filter((entity) => {
                return entity.isMintEvent() && entity.timestamp <= nftEventFilterEntity.timestampTo && entity.timestamp >= nftEventFilterEntity.timestampFrom;
            })
            .sort((a, b) => b.timestamp - a.timestamp);

        const nftEventMap = new Map<string, NftEventEntity>();
        nftEventEntities.forEach((entity) => nftEventMap.set(entity.nftId, entity));

        const total = nftEventEntities.length;

        nftEntities = nftEntities.filter((entity) => nftEventMap.get(entity.id));

        const result = { nftEventEntities, nftEntities, total };

        // Act
        const userEarningsEntity = await service.fetchNftEventsByFilter(null, nftEventFilterEntity, undefined);

        // Assert
        expect(userEarningsEntity.total).toEqual(result.total);
        expect(userEarningsEntity.nftEventEntities).toEqual(result.nftEventEntities);
        expect(userEarningsEntity.nftEntities.sort((a, b) => a.id.localeCompare(b.id))).toEqual(result.nftEntities.sort((a, b) => a.id.localeCompare(b.id)));
    });

    it('fetchNftEventsByFilter by farmid: Happy path', async () => {
        // Arange
        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.miningFarmId = '1';
        nftEventFilterEntity.count = 10;
        nftEventFilterEntity.eventTypes = [NftTransferHistoryEventType.MINT];
        nftEventFilterEntity.from = 0;
        nftEventFilterEntity.timestampFrom = getZeroDatePlusDaysTimestamp(1);
        nftEventFilterEntity.timestampTo = getZeroDatePlusDaysTimestamp(3);

        const collectionIds = collectionEntities.filter((collectionEntity) => collectionEntity.farmId === 1)
            .map((collectionEntity) => collectionEntity.id);

        let nftEntities = nftTestEntitities.filter((json) => collectionIds.includes(json.collectionId));
        const resultNftEntitiesUniqIds = nftEntities.map((entity) => {
            const collection = collectionEntities.find((collectionEntity) => collectionEntity.id === entity.collectionId);
            return `${entity.tokenId}@${collection.denomId}`;
        });

        const nftEventEntities = getGraphQlMarketplaceNftEvents()
            .filter((entity) => resultNftEntitiesUniqIds.includes(`${entity.tokenId}@${entity.denomId}`))
            .map((entity) => {
                const nftEventEntity = NftEventEntity.fromNftMarketplaceTradeHistory(entity);
                const collection = collectionEntities.find((collectionEntity) => collectionEntity.denomId === nftEventEntity.denomId)
                const nft = nftEntities.find((nftEntity) => nftEntity.tokenId === nftEventEntity.tokenId && nftEntity.collectionId === collection.id);

                nftEventEntity.nftId = nft.id;
                return nftEventEntity;
            })
            .filter((entity) => {
                return entity.isMintEvent() && entity.timestamp <= nftEventFilterEntity.timestampTo && entity.timestamp >= nftEventFilterEntity.timestampFrom;
            })
            .sort((a, b) => b.timestamp - a.timestamp);

        const nftEventMap = new Map<string, NftEventEntity>();
        nftEventEntities.forEach((entity) => nftEventMap.set(entity.nftId, entity));

        const total = nftEventEntities.length;

        nftEntities = nftEntities.filter((entity) => nftEventMap.get(entity.id));

        const expected = { nftEventEntities, nftEntities, total };

        // Act
        const result = await service.fetchNftEventsByFilter(null, nftEventFilterEntity, undefined);

        // Assert
        expect(expected.total).toEqual(result.total);
        expect(expected.nftEventEntities).toEqual(result.nftEventEntities);
        expect(expected.nftEntities.sort((a, b) => a.id.localeCompare(b.id))).toEqual(result.nftEntities.sort((a, b) => a.id.localeCompare(b.id)));
    });

    it('fetchNftEventsByFilter: By platform transferred', async () => {
        // Arange
        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.count = 10;
        nftEventFilterEntity.eventTypes = [NftTransferHistoryEventType.TRANSFER];
        nftEventFilterEntity.from = 0;
        nftEventFilterEntity.timestampFrom = getZeroDatePlusDaysTimestamp(1);
        nftEventFilterEntity.timestampTo = getZeroDatePlusDaysTimestamp(3);

        let nftEntities = nftTestEntitities

        const resultNftEntitiesUniqIds = nftEntities.map((entity) => {
            const collection = collectionEntities.find((collectionEntity) => collectionEntity.id === entity.collectionId);
            return `${entity.tokenId}@${collection.denomId}`;
        });

        const nftEventEntities = getGraphQlNftNftEvents()
            .filter((entity) => resultNftEntitiesUniqIds.includes(`${entity.tokenId}@${entity.denomId}`))
            .map((entity) => {
                const nftEventEntity = NftEventEntity.fromNftModuleTransferHistory(entity);
                const collection = collectionEntities.find((collectionEntity) => collectionEntity.denomId === nftEventEntity.denomId)
                const nft = nftEntities.find((nftEntity) => nftEntity.tokenId === nftEventEntity.tokenId && nftEntity.collectionId === collection.id);

                nftEventEntity.nftId = nft.id;
                return nftEventEntity;
            })
            .filter((entity) => {
                return entity.isTransferEvent() && entity.timestamp <= nftEventFilterEntity.timestampTo && entity.timestamp >= nftEventFilterEntity.timestampFrom;
            })
            .sort((a, b) => b.timestamp - a.timestamp);

        const nftEventMap = new Map<string, NftEventEntity>();
        nftEventEntities.forEach((entity) => nftEventMap.set(entity.nftId, entity));

        const total = nftEventEntities.length;

        nftEntities = nftEntities.filter((entity) => nftEventMap.get(entity.id));

        const result = { nftEventEntities, nftEntities, total };

        // Act
        const userEarningsEntity = await service.fetchNftEventsByFilter(null, nftEventFilterEntity, undefined);

        // Assert
        expect(userEarningsEntity.total).toEqual(result.total);
        expect(userEarningsEntity.nftEventEntities).toEqual(result.nftEventEntities);
        expect(userEarningsEntity.nftEntities.sort((a, b) => a.id.localeCompare(b.id))).toEqual(result.nftEntities.sort((a, b) => a.id.localeCompare(b.id)));
    });

    it('fetchEarningsPerDay: cudos farm earnings Happy path', async () => {
        // Arrange
        const expectedUserEraningsEntity = EarningsEntity.fromJson({
            acudosEarningsPerDay: [
                '2.9', '0.3', '0',
            ],
            btcEarningsPerDay: [],
        });

        // Act
        const earningsPerDayFilterEntity = new EarningsPerDayFilterEntity();
        earningsPerDayFilterEntity.timestampFrom = getZeroDatePlusDaysTimestamp(2);
        earningsPerDayFilterEntity.timestampTo = getZeroDatePlusDaysTimestamp(4);
        earningsPerDayFilterEntity.farmId = '1';
        earningsPerDayFilterEntity.currency = EarningsPerDayCurrency.CUDOS

        const userEarningsEntity = await service.fetchEarningsPerDay(earningsPerDayFilterEntity, undefined);

        // Assert
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsPerDay: BTC farm earnings Happy path', async () => {
        // Arrange
        const expectedUserEraningsEntity = EarningsEntity.fromJson({
            acudosEarningsPerDay: [],
            btcEarningsPerDay: [
                '3', '4', '5',
            ],
        });

        // Act
        const earningsPerDayFilterEntity = new EarningsPerDayFilterEntity();
        earningsPerDayFilterEntity.timestampFrom = getZeroDatePlusDaysTimestamp(2);
        earningsPerDayFilterEntity.timestampTo = getZeroDatePlusDaysTimestamp(4);
        earningsPerDayFilterEntity.farmId = '1';
        earningsPerDayFilterEntity.currency = EarningsPerDayCurrency.BTC

        const userEarningsEntity = await service.fetchEarningsPerDay(earningsPerDayFilterEntity, undefined);

        // Assert
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsPerDay: cudos platform earnings Happy path', async () => {
        // Arrange
        const expectedUserEraningsEntity = EarningsEntity.fromJson({
            acudosEarningsPerDay: [
                '0.5', '0.7', '0.9',
            ],
            btcEarningsPerDay: [],
        });

        // Act
        const earningsPerDayFilterEntity = new EarningsPerDayFilterEntity();
        earningsPerDayFilterEntity.timestampFrom = getZeroDatePlusDaysTimestamp(2);
        earningsPerDayFilterEntity.timestampTo = getZeroDatePlusDaysTimestamp(4);
        earningsPerDayFilterEntity.currency = EarningsPerDayCurrency.CUDOS

        const userEarningsEntity = await service.fetchEarningsPerDay(earningsPerDayFilterEntity, undefined);

        // Assert
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsPerDay: BTC platform earnings Happy path', async () => {
        // Arrange
        const expectedUserEraningsEntity = EarningsEntity.fromJson({
            acudosEarningsPerDay: [
            ],
            btcEarningsPerDay: [
                '3', '4', '5',
            ],
        });

        // Act
        const earningsPerDayFilterEntity = new EarningsPerDayFilterEntity();
        earningsPerDayFilterEntity.timestampFrom = getZeroDatePlusDaysTimestamp(2);
        earningsPerDayFilterEntity.timestampTo = getZeroDatePlusDaysTimestamp(4);
        earningsPerDayFilterEntity.currency = EarningsPerDayCurrency.BTC

        const userEarningsEntity = await service.fetchEarningsPerDay(earningsPerDayFilterEntity, undefined);

        // Assert
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchMegaWalletEventsByFilter: happy path', async () => {
        // Arrange
        const megaWalletEventFilter = new MegaWalletEventFilterEntity();
        megaWalletEventFilter.timestampFrom = getZeroDatePlusDaysTimestamp(2);
        megaWalletEventFilter.timestampTo = getZeroDatePlusDaysTimestamp(4);

        let nftEntities = nftTestEntitities
        const resultNftEntitiesUniqIds = nftEntities.map((entity) => {
            const collection = collectionEntities.find((collectionEntity) => collectionEntity.id === entity.collectionId);
            return `${entity.tokenId}@${collection.denomId}`;
        });

        const denomIdMarketplaceCollectionEntityMap = new Map();
        getGraphQlmarketplaceCollections().forEach((entity) => {
            denomIdMarketplaceCollectionEntityMap.set(entity.denomId, entity);
        })

        const denomIdCollectionMap = new Map<string, CollectionEntity>();
        collectionEntities.forEach((collectionEntity) => {
            denomIdCollectionMap.set(collectionEntity.denomId, collectionEntity);
        })

        const farmIdFarmMap = new Map<number, MiningFarmEntity>();
        miningFarmEntities.forEach((farmEntity) => {
            farmIdFarmMap.set(farmEntity.id, farmEntity);
        })

        const nftEventEntities = getGraphQlMarketplaceNftEvents()
            .filter((entity) => resultNftEntitiesUniqIds.includes(`${entity.tokenId}@${entity.denomId}`))
            .map((entity) => {
                const nftEventEntity = NftEventEntity.fromNftMarketplaceTradeHistory(entity);
                const collection = collectionEntities.find((collectionEntity) => collectionEntity.denomId === nftEventEntity.denomId)
                const nft = nftEntities.find((nftEntity) => nftEntity.tokenId === nftEventEntity.tokenId && nftEntity.collectionId === collection.id);

                nftEventEntity.nftId = nft.id;
                return nftEventEntity;
            })
            .filter((entity) => {
                return entity.hasPrice();
            });

        const megaWalletEventEntities = nftEventEntities.map((eventEntity) => {
            const chainCollectionEntity = denomIdMarketplaceCollectionEntityMap.get(eventEntity.denomId);
            const collectionEntity = denomIdCollectionMap.get(chainCollectionEntity.denomId);
            const farmEntity = farmIdFarmMap.get(collectionEntity.farmId);
            return MegaWalletEventEntity.fromNftEventEntity(eventEntity, chainCollectionEntity, farmEntity)
        })
            .filter((entity) => {
                return entity.timestamp <= megaWalletEventFilter.timestampTo && entity.timestamp >= megaWalletEventFilter.timestampFrom;
            });

        megaWalletEventEntities.sort((a, b) => b.timestamp - a.timestamp)

        const nftEventMap = new Map<string, MegaWalletEventEntity>();
        megaWalletEventEntities.forEach((entity) => nftEventMap.set(entity.nftId, entity));

        const resultNftEntitiesMap = new Map < string, NftEntity >();
        megaWalletEventEntities.forEach((entity) => {
            const resultNftEntity = nftEntities.find((nftEntity) => nftEntity.id === entity.nftId);
            resultNftEntitiesMap.set(resultNftEntity.id, resultNftEntity);
        });
        nftEntities = [];
        resultNftEntitiesMap.forEach((nftEntity) => {
            nftEntities.push(nftEntity);
        });

        const result = {
            megaWalletEventEntities,
            nftEntities,
            total: nftEventEntities.length,
        }
        result.nftEntities.sort((a: NftEntity, b: NftEntity) => {
            return a.id.localeCompare(b.id);
        })

        // Act
        const userEarningsEntity = await service.fetchMegaWalletEventsByFilter(megaWalletEventFilter, undefined);
        userEarningsEntity.nftEntities.sort((a: NftEntity, b: NftEntity) => {
            return a.id.localeCompare(b.id);
        });

        // Assert
        expect(userEarningsEntity).toEqual(result);
    });
});
