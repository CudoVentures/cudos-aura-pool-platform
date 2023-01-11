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
import NftEventEntity, { NftTransferHistoryEventType } from './entities/nft-event.entity';
import { IntBoolValue } from '../common/utils';
import { NftRepo } from '../nft/repos/nft.repo';
import { v4 as uuidv4 } from 'uuid';
import { NftStatus } from '../nft/nft.types';
import NftEntity from '../nft/entities/nft.entity';
import { CollectionRepo } from '../collection/repos/collection.repo';
import { CollectionStatus } from '../collection/utils';
import { DataServiceError } from '../common/errors/errors';
import { collectionEntities } from '../../test/data/collections.data';

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
        jest.spyOn(graphQlService, 'fetchNftPlatformTransferHistory').mockImplementation(async () => getGraphQlNftNftEvents());
        jest.spyOn(graphQlService, 'fetchMarketplacePlatformNftTradeHistory').mockImplementation(async () => getGraphQlMarketplaceNftEvents());

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
        expect(() => service.fetchEarningsByMiningFarmId(1, timestampFrom, timestampTo)).rejects.toThrow(DataServiceError);
        expect(() => service.fetchEarningsByCudosAddress('testowner', timestampFrom, timestampTo)).rejects.toThrow(DataServiceError);
        expect(() => service.fetchEarningsByNftId(uuidv4(), timestampFrom, timestampTo)).rejects.toThrow(DataServiceError);
        expect(() => service.fetchNftEventsByFilter(null, nftEventFilterEntity)).rejects.toThrow(DataServiceError);
    });

    it('fetchEarningsByCudosAddress: Happy path', async () => {
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

    it('fetchEarningsByCudosAddress: Not owned, expired and removed NFTs', async () => {
        // adding data to db that shouldn't be calculated
        await NftRepo.create({ // not owned
            id: uuidv4(), name: 'nftX', uri: 'someuri', data: 'somestring', hashingPower: 1, price: '231400', expirationDate: new Date(2024, 10, 10), status: NftStatus.MINTED, tokenId: 10, collectionId: 1, creatorId: 1, deletedAt: null, currentOwner: 'testowner2', marketplaceNftId: 10,
        });
        await NftRepo.create({ // owned but expired
            id: uuidv4(), name: 'nftX2', uri: 'someuri', data: 'somestring', hashingPower: 1, price: '1231400', expirationDate: new Date(0), status: NftStatus.MINTED, tokenId: 11, collectionId: 1, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 10,
        });
        await NftRepo.create({ // owned but expired
            id: uuidv4(), name: 'nftX3', uri: 'someuri', data: 'somestring', hashingPower: 1, price: '21231400', expirationDate: new Date(2024, 9, 9), status: NftStatus.REMOVED, tokenId: 12, collectionId: 1, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 10,
        });

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

    it('fetchEarningsByCudosAddress: BigNumber calculations and not sent payouts', async () => {
        // adding data to db that shouldn't be calculated
        await NftRepo.create({ // not owned
            id: uuidv4(), name: 'nftX', uri: 'someuri', data: 'somestring', hashingPower: 1, price: '123412312490071992547409919007199254740991.90071992547409919007199254740991', expirationDate: new Date(2024, 10, 10), status: NftStatus.MINTED, tokenId: 'onchain_token', collectionId: 1, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 10,
        });
        await NftPayoutHistoryRepo.create({
            id: 10, token_id: 10, denom_id: `testdenomid${10}`, payout_period_start: getZeroDatePlusDaysTimestamp(0), payout_period_end: getZeroDatePlusDaysTimestamp(5), reward: '190071992547409919007199254740991.90071992547409919007199254740991', tx_hash: 'txhash10', maintenance_fee: 10, cudo_part_of_maintenance_fee: 10, cudo_part_of_reward: 0.2, createdAt: new Date(getZeroDatePlusDaysTimestamp(9)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(9)),
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

        const userEarningsEntity = await service.fetchEarningsByCudosAddress('testowner', getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(10));
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByNftId: Happy path', async () => {
        const expectedUserEraningsEntity = NftEarningsEntity.fromJson({
            earningsPerDayInBtc: ['3', '0', '0'],
        });

        const nftEarningsEntity = await service.fetchEarningsByNftId(nftTestEntitities[2].id, getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4));
        expect(nftEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByNftId: Queued NFTs', async () => {
        const id = uuidv4();
        await NftRepo.create({ // not owned
            id, name: 'nftX', uri: 'someuri', data: 'somestring', hashingPower: 1, price: '1.2', expirationDate: new Date(2024, 10, 10), status: NftStatus.QUEUED, tokenId: 10, collectionId: 1, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 10,
        });
        await NftPayoutHistoryRepo.create({
            id: 10, token_id: 10, denom_id: `testdenomid${10}`, payout_period_start: getZeroDatePlusDaysTimestamp(0), payout_period_end: getZeroDatePlusDaysTimestamp(5), reward: '190071992547409919007199254740991.90071992547409919007199254740991', tx_hash: 'txhash10', maintenance_fee: 10, cudo_part_of_maintenance_fee: 10, cudo_part_of_reward: 0.2, createdAt: new Date(getZeroDatePlusDaysTimestamp(3)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(3)),
        })
        await NftOwnersPayoutHistoryRepo.create({
            id: 10, time_owned_from: 10, time_owned_to: 10, total_time_owned: 10, percent_of_time_owned: 10, owner: 'testowner', payout_address: 'testpayout', reward: '90071992547409919007199254740991.90071992547409919007199254740991', nft_payout_history_id: 10, createdAt: new Date(getZeroDatePlusDaysTimestamp(3)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(3)), sent: true,
        });

        const expectedUserEraningsEntity = NftEarningsEntity.fromJson({
            earningsPerDayInBtc: ['0', '0', '0'],
        });

        const nftEarningsEntity = await service.fetchEarningsByNftId(id, getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4));
        expect(nftEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByNftId: Removed NFTs', async () => {
        // Arrange
        const id = uuidv4();
        await NftRepo.create({ // not owned
            id, name: 'nftX', uri: 'someuri', data: 'somestring', hashingPower: 1, price: '1.2', expirationDate: new Date(2024, 10, 10), status: NftStatus.REMOVED, tokenId: 10, collectionId: 1, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 10,
        });
        await NftPayoutHistoryRepo.create({
            id: 10, token_id: 10, denom_id: `testdenomid${10}`, payout_period_start: getZeroDatePlusDaysTimestamp(0), payout_period_end: getZeroDatePlusDaysTimestamp(5), reward: '190071992547409919007199254740991.90071992547409919007199254740991', tx_hash: 'txhash10', maintenance_fee: 10, cudo_part_of_maintenance_fee: 10, cudo_part_of_reward: 0.2, createdAt: new Date(getZeroDatePlusDaysTimestamp(3)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(3)),
        })
        await NftOwnersPayoutHistoryRepo.create({
            id: 10, time_owned_from: 10, time_owned_to: 10, total_time_owned: 10, percent_of_time_owned: 10, owner: 'testowner', payout_address: 'testpayout', reward: '90071992547409919007199254740991.90071992547409919007199254740991', nft_payout_history_id: 10, createdAt: new Date(getZeroDatePlusDaysTimestamp(3)), updatedAt: new Date(getZeroDatePlusDaysTimestamp(3)), sent: true,
        });

        const expectedUserEraningsEntity = NftEarningsEntity.fromJson({
            earningsPerDayInBtc: ['0', '0', '0'],
        });

        // Act
        const nftEarningsEntity = await service.fetchEarningsByNftId(id, getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4));

        // Assert
        expect(nftEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByMiningFarmId: Happy path', async () => {
        // Arrange
        const expectedUserEraningsEntity = MiningFarmEarningsEntity.fromJson({
            totalMiningFarmSalesInAcudos: '6',
            totalMiningFarmRoyaltiesInAcudos: '0.6',
            totalNftSold: 3,
            maintenanceFeeDepositedInBtc: '6',
            earningsPerDayInAcudos: [
                '2.9', '0.3', '0',
            ],
        });

        // Act
        const userEarningsEntity = await service.fetchEarningsByMiningFarmId(1, getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4));

        // Assert
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    // should not include any data that:
    // - is for collection that is not for that farm
    // - is outside the timeframe borders
    // - is for not minted nfts
    it('fetchEarningsByMiningFarmId: NFTs, collections, events not for a farm', async () => {
        // Arrange
        const id = uuidv4();
        const id2 = uuidv4();
        const id3 = uuidv4();
        const id4 = uuidv4();
        const id5 = uuidv4();
        const id6 = uuidv4();

        await CollectionRepo.create({ // collection in different farm
            id: 123, name: 'string', description: 'string', denomId: 'string', hashingPower: 4, royalties: 5, mainImage: 'string', bannerImage: 'string', status: CollectionStatus.APPROVED, farmId: 999, creatorId: 23, deletedAt: null,
        });

        await CollectionRepo.create({ // collection in farm but not approved
            id: 124, name: 'string2', description: 'string2', denomId: 'string2', hashingPower: 4, royalties: 5, mainImage: 'string', bannerImage: 'string', status: CollectionStatus.QUEUED, farmId: 1, creatorId: 23, deletedAt: null,
        });

        await NftRepo.create({ // nft in first collection not for this farm
            id, name: 'nftX', uri: 'someuri', data: 'somestring', hashingPower: 1, price: '1.2', expirationDate: new Date(2024, 10, 10), status: NftStatus.MINTED, tokenId: 10, collectionId: 123, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 10,
        });

        await NftRepo.create({ // nft in second collection
            id: id2, name: 'nftX2', uri: 'someuri', data: 'somestring', hashingPower: 1, price: '1.2', expirationDate: new Date(2024, 10, 10), status: NftStatus.QUEUED, tokenId: 11, collectionId: 124, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 11,
        });

        // collection is queued but nft minted. For now it will be included in statistics
        await NftRepo.create({ // nft in second collection but not minted
            id: id3, name: 'nftX3', uri: 'someuri', data: 'somestring', hashingPower: 1, price: '1.2', expirationDate: new Date(2024, 10, 10), status: NftStatus.MINTED, tokenId: 12, collectionId: 124, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 12,
        });
        await NftRepo.create({ // nft in second collection but removed
            id: id4, name: 'nftX4', uri: 'someuri', data: 'somestring', hashingPower: 1, price: '1.2', expirationDate: new Date(2024, 10, 10), status: NftStatus.REMOVED, tokenId: 13, collectionId: 124, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 13,
        });
        await NftRepo.create({ // nft in correct collection and farm, but not minted
            id: id5, name: 'nftX5', uri: 'someuri', data: 'somestring', hashingPower: 1, price: '1.2', expirationDate: new Date(2024, 10, 10), status: NftStatus.QUEUED, tokenId: 14, collectionId: 3, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 14,
        });
        await NftRepo.create({ // nft in correct collection and farm, but removed
            id: id6, name: 'nftX6', uri: 'someuri', data: 'somestring', hashingPower: 1, price: '1.2', expirationDate: new Date(2024, 10, 10), status: NftStatus.REMOVED, tokenId: 15, collectionId: 3, creatorId: 1, deletedAt: null, currentOwner: 'testowner', marketplaceNftId: 15,
        });

        const expectedUserEraningsEntity = MiningFarmEarningsEntity.fromJson({
            totalMiningFarmSalesInAcudos: '6',
            totalMiningFarmRoyaltiesInAcudos: '0.6',
            totalNftSold: 4,
            maintenanceFeeDepositedInBtc: '6',
            earningsPerDayInAcudos: [
                '2.9', '0.3', '0',
            ],
        });

        // Act
        const userEarningsEntity = await service.fetchEarningsByMiningFarmId(1, getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4));

        // Assert
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByMiningFarmId: Non-existing farm should return zeroes', async () => {
        // Arrange
        const expectedUserEraningsEntity = MiningFarmEarningsEntity.fromJson({
            totalMiningFarmSalesInAcudos: '0',
            totalMiningFarmRoyaltiesInAcudos: '0',
            totalNftSold: 0,
            maintenanceFeeDepositedInBtc: '0',
            earningsPerDayInAcudos: [
                '0', '0', '0',
            ],
        });

        // Act
        const userEarningsEntity = await service.fetchEarningsByMiningFarmId(9999, getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(4));

        // Assert
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });

    it('fetchEarningsByMiningFarmId: No data for timeframe should return zeroes for statistics and correct for totals', async () => {
        // Arrange
        const expectedUserEraningsEntity = MiningFarmEarningsEntity.fromJson({
            totalMiningFarmSalesInAcudos: '6',
            totalMiningFarmRoyaltiesInAcudos: '0.6',
            totalNftSold: 3,
            maintenanceFeeDepositedInBtc: '6',
            earningsPerDayInAcudos: ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
        });

        // Act
        const userEarningsEntity = await service.fetchEarningsByMiningFarmId(1, getZeroDatePlusDaysTimestamp(20), getZeroDatePlusDaysTimestamp(29));

        // Assert
        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
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

        let nftEntities = nftTestEntitities.filter((json) => json.currentOwner === userEntity.cudosWalletAddress).map((json) => NftEntity.fromRepo(json));
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
            });

        const nftEventMap = new Map<string, NftEventEntity>();
        nftEventEntities.forEach((entity) => nftEventMap.set(entity.nftId, entity));

        const total = nftEventEntities.length;
        nftEntities = nftEntities.filter((entity) => nftEventMap.get(entity.id));

        const result = { nftEventEntities, nftEntities, total };

        // Act
        const userEarningsEntity = await service.fetchNftEventsByFilter(userEntity, nftEventFilterEntity);

        // Assert
        expect(userEarningsEntity).toEqual(result);
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

        let nftEntities = nftTestEntitities.map((json) => NftEntity.fromRepo(json));
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
            });

        const nftEventMap = new Map<string, NftEventEntity>();
        nftEventEntities.forEach((entity) => nftEventMap.set(entity.nftId, entity));

        const total = nftEventEntities.length;
        nftEntities = nftEntities.filter((entity) => nftEventMap.get(entity.id));

        const result = { nftEventEntities, nftEntities, total };

        // Act
        const userEarningsEntity = await service.fetchNftEventsByFilter(userEntity, nftEventFilterEntity);

        // Assert
        expect(userEarningsEntity).toEqual(result);
    });

    it('fetchNftEventsByFilter: By platform minted', async () => {
        // Arange
        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.count = 10;
        nftEventFilterEntity.eventTypes = [NftTransferHistoryEventType.MINT];
        nftEventFilterEntity.from = 0;
        nftEventFilterEntity.timestampFrom = getZeroDatePlusDaysTimestamp(1);
        nftEventFilterEntity.timestampTo = getZeroDatePlusDaysTimestamp(3);

        let nftEntities = nftTestEntitities.map((json) => NftEntity.fromRepo(json));

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
            });

        const nftEventMap = new Map<string, NftEventEntity>();
        nftEventEntities.forEach((entity) => nftEventMap.set(entity.nftId, entity));

        const total = nftEventEntities.length;

        nftEntities = nftEntities.filter((entity) => nftEventMap.get(entity.id));

        const result = { nftEventEntities, nftEntities, total };

        // Act
        const userEarningsEntity = await service.fetchNftEventsByFilter(null, nftEventFilterEntity);

        // Assert
        expect(userEarningsEntity).toEqual(result);
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

        let nftEntities = nftTestEntitities.filter((json) => collectionIds.includes(json.collectionId))
            .map((json) => NftEntity.fromRepo(json));
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
            });

        const nftEventMap = new Map<string, NftEventEntity>();
        nftEventEntities.forEach((entity) => nftEventMap.set(entity.nftId, entity));

        const total = nftEventEntities.length;

        nftEntities = nftEntities.filter((entity) => nftEventMap.get(entity.id));

        const result = { nftEventEntities, nftEntities, total };

        // Act
        const userEarningsEntity = await service.fetchNftEventsByFilter(null, nftEventFilterEntity);

        // Assert
        expect(userEarningsEntity).toEqual(result);
    });

    it('fetchNftEventsByFilter: By platform transferred', async () => {
        // Arange
        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.count = 10;
        nftEventFilterEntity.eventTypes = [NftTransferHistoryEventType.TRANSFER];
        nftEventFilterEntity.from = 0;
        nftEventFilterEntity.timestampFrom = getZeroDatePlusDaysTimestamp(1);
        nftEventFilterEntity.timestampTo = getZeroDatePlusDaysTimestamp(3);

        let nftEntities = nftTestEntitities.map((json) => NftEntity.fromRepo(json));

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
            });

        const nftEventMap = new Map<string, NftEventEntity>();
        nftEventEntities.forEach((entity) => nftEventMap.set(entity.nftId, entity));

        const total = nftEventEntities.length;

        nftEntities = nftEntities.filter((entity) => nftEventMap.get(entity.id));

        const result = { nftEventEntities, nftEntities, total };

        // Act
        const userEarningsEntity = await service.fetchNftEventsByFilter(null, nftEventFilterEntity);

        // Assert
        expect(userEarningsEntity).toEqual(result);
    });
});
