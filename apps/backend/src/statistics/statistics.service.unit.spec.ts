import { ConfigService } from '@nestjs/config';
import { CollectionService } from '../collection/collection.service';
import NftEntity from '../nft/entities/nft.entity';
import { NFTService } from '../nft/nft.service';
import { StatisticsService } from './statistics.service';
import { FarmService } from '../farm/farm.service';
import { GraphqlService } from '../graphql/graphql.service';
import UserEntity from '../account/entities/user.entity';
import NftEventFilterEntity from './entities/nft-event-filter.entity';
import NftEventEntity, { NftTransferHistoryEventType } from './entities/nft-event.entity';
import { createBasicMintedNft, createBasicNftMintEvent, createBasicNftSaleEvent, createBasicNftTransferEvent, createBasicUser, createMegaWalletEventFilterEntity, createNftEventPlatformFilterEntity, createNftEventSessionAccountFilterEntity } from './utils/test.utils';
import { CollectionDenomNotFoundError, DataServiceError, ERROR_TYPES } from '../common/errors/errors';
import MegaWalletEventFilterEntity from './entities/mega-wallet-event-filter.entity';
import MegaWalletEventEntity from './entities/mega-wallet-event.entity';
import ChainMarketplaceCollectionEntity from '../collection/entities/chain-marketplace-collection.entity';
import { CollectionEntity } from '../collection/entities/collection.entity';
import MiningFarmEntity from '../farm/entities/mining-farm.entity';
import { NOT_EXISTS_STRING } from '../common/utils';
import { HttpException } from '@nestjs/common';

const SequelizeMock = require('sequelize-mock');

const dbMock = new SequelizeMock();

describe('NFTService', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    })

    const NftPayoutHistoryRepo = dbMock.define('nfts', {}, { timestamps: false });
    const NftOwnersPayoutHistoryRepo = dbMock.define('nfts', {}, { timestamps: false });
    const AddressesPayoutHistoryRepo = dbMock.define('nfts', {}, { timestamps: false });
    const CollectionPaymentAllocationRepo = dbMock.define('nfts', {}, { timestamps: false });

    const service = new StatisticsService(
        new NFTService(null, null, null, null, null),
        new CollectionService(null, null, null, null, null, null),
        new FarmService(null, null, null, null, null, null, null, null, null, null, null),
        new ConfigService(),
        new GraphqlService(null),
        NftPayoutHistoryRepo,
        NftOwnersPayoutHistoryRepo,
        AddressesPayoutHistoryRepo,
        CollectionPaymentAllocationRepo,
    );

    type FetchUsersSpendingOnPlatformInUsdTestData = {
        testName: string,
        callParams: {
            userEntity: UserEntity,
        },
        nftEventEntities: NftEventEntity[],
        result: number | Error
    }

    const fetchUsersSpendingOnPlatformInUsdTestData: FetchUsersSpendingOnPlatformInUsdTestData[] = [
        {
            testName: 'No events returns 0',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
            },
            nftEventEntities: [],
            result: 0,
        },
        {
            testName: 'Null user returns 0',
            callParams: {
                userEntity: null,
            },
            nftEventEntities: [],
            result: 0,
        },
        {
            testName: 'Sum of only non mint and non sale events returns 0',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
            },
            nftEventEntities: [
                createBasicNftTransferEvent('', '', '', '', '', 0, 10, '', ''),
            ],
            result: 0,
        },
        {
            testName: 'Events with toAddress != userCudosAddress should count',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
            },
            nftEventEntities: [
                createBasicNftSaleEvent('', '', '', '', 'wrongCudosAddress', 0, 10, '', ''),
                createBasicNftSaleEvent('', '', '', '', 'wrongCudosAddress', 0, 2.5, '', ''),
                createBasicNftMintEvent('', '', '', '', 'wrongCudosAddress', 0, 10, '', ''),
            ],
            result: 0,
        },
        {
            testName: 'Sum with partial should return integer',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
            },
            nftEventEntities: [
                createBasicNftSaleEvent('', '', '', '', 'userCudosAddress', 0, 10, '', ''),
                createBasicNftSaleEvent('', '', '', '', 'userCudosAddress', 0, 2.2, '', ''),
                createBasicNftMintEvent('', '', '', '', 'userCudosAddress', 0, 10, '', ''),
            ],
            result: 22,
        },
        {
            testName: 'Sum with partial should round to ceil above .5',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
            },
            nftEventEntities: [
                createBasicNftSaleEvent('', '', '', '', 'userCudosAddress', 0, 10, '', ''),
                createBasicNftSaleEvent('', '', '', '', 'userCudosAddress', 0, 2.5, '', ''),
                createBasicNftMintEvent('', '', '', '', 'userCudosAddress', 0, 10, '', ''),
            ],
            result: 23,
        },
        {
            testName: 'Nft MINT events should count only once',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
            },
            nftEventEntities: [
                createBasicNftSaleEvent('', '', '', '', 'userCudosAddress', 0, 10, '', ''),
                createBasicNftMintEvent('', '', '', '', 'userCudosAddress', 0, 10, '', ''),
                createBasicNftMintEvent('', '', '', '', 'userCudosAddress', 0, 10, '', ''),
            ],
            result: 20,
        },
    ];

    fetchUsersSpendingOnPlatformInUsdTestData.forEach((testData: FetchUsersSpendingOnPlatformInUsdTestData) => it(`fetchUsersSpendingOnPlatformInUsd: ${testData.testName}`, async () => {
        jest.spyOn(service, 'fetchNftEventsByFilter').mockImplementation(async () => { return { nftEventEntities: testData.nftEventEntities, nftEntities: null, total: 0 } })

        expect(await service.fetchUsersSpendingOnPlatformInUsd(testData.callParams.userEntity)).toEqual(testData.result)
    }))

    type FetchNftEventsByFilterTestData = {
        testName: string,
        callParams: {
            userEntity: UserEntity,
            nftEventFilterENtity: NftEventFilterEntity
        },
        fetchPlatformNftEventsReturns: {
            nftEventEntities: NftEventEntity[],
            nftEntitiesMap: Map<string, NftEntity>
        },
        fetchNftEventsByNftFilterReturs: {
            nftEventEntities: NftEventEntity[],
            nftEntitiesMap: Map<string, NftEntity>
        },
        result: {
            nftEventEntities: NftEventEntity[],
            nftEntities: NftEntity[],
            total: number
        } | ERROR_TYPES
    }

    const fetchNftEventsByFilterTestData: FetchNftEventsByFilterTestData[] = [
        {
            testName: 'invalid timestamp filter should throw error',
            callParams: {
                userEntity: null,
                nftEventFilterENtity: createNftEventSessionAccountFilterEntity(1, [], 2, 1, 10, 10),
            },
            fetchPlatformNftEventsReturns: null,
            fetchNftEventsByNftFilterReturs: null,
            result: ERROR_TYPES.DATA_SERVICE_ERROR,
        },
        {
            testName: 'no events found should return empty arrays and zero total',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
                nftEventFilterENtity: createNftEventPlatformFilterEntity([], 0, 10, 0, 10),
            },
            fetchPlatformNftEventsReturns: {
                nftEventEntities: [
                ],
                nftEntitiesMap: new Map([
                ]),
            },
            fetchNftEventsByNftFilterReturs: null,
            result: {
                nftEventEntities: [
                ],
                nftEntities: [
                ],
                total: 0,
            },
        },
        {
            testName: 'events should be sorted by timestamp ASC',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
                nftEventFilterENtity: createNftEventPlatformFilterEntity(null, 0, 10, 0, 10),
            },
            fetchPlatformNftEventsReturns: {
                nftEventEntities: [
                    createBasicNftSaleEvent('nftId', '', '', '', '', 5, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 2, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 4, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 1, 10, '', ''),
                ],
                nftEntitiesMap: new Map([
                    ['nftId', createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a')],
                ]),
            },
            fetchNftEventsByNftFilterReturs: null,
            result: {
                nftEventEntities: [
                    createBasicNftSaleEvent('nftId', '', '', '', '', 1, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 2, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 4, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 5, 10, '', ''),
                ],
                nftEntities: [
                    createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a'),
                ],
                total: 4,
            },
        },
        {
            testName: 'events should sliced by timestamp',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
                nftEventFilterENtity: createNftEventPlatformFilterEntity(null, 0, 4, 0, 10),
            },
            fetchPlatformNftEventsReturns: {
                nftEventEntities: [
                    createBasicNftSaleEvent('nftId', '', '', '', '', 5, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 2, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 4, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 1, 10, '', ''),
                ],
                nftEntitiesMap: new Map([
                    ['nftId', createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a')],
                ]),
            },
            fetchNftEventsByNftFilterReturs: null,
            result: {
                nftEventEntities: [
                    createBasicNftSaleEvent('nftId', '', '', '', '', 1, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 2, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 4, 10, '', ''),
                ],
                nftEntities: [
                    createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a'),
                ],
                total: 3,
            },
        },
        {
            testName: 'events should sliced by from and to and total should not be lowered',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
                nftEventFilterENtity: createNftEventPlatformFilterEntity(null, 0, 10, 0, 2),
            },
            fetchPlatformNftEventsReturns: {
                nftEventEntities: [
                    createBasicNftSaleEvent('nftId', '', '', '', '', 5, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 2, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 4, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 1, 10, '', ''),
                ],
                nftEntitiesMap: new Map([
                    ['nftId', createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a')],
                ]),
            },
            fetchNftEventsByNftFilterReturs: null,
            result: {
                nftEventEntities: [
                    createBasicNftSaleEvent('nftId', '', '', '', '', 1, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 2, 10, '', ''),
                ],
                nftEntities: [
                    createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a'),
                ],
                total: 4,
            },
        },
        {
            testName: 'slicing events should remove according nfts as well',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
                nftEventFilterENtity: createNftEventPlatformFilterEntity(null, 0, 10, 0, 2),
            },
            fetchPlatformNftEventsReturns: {
                nftEventEntities: [
                    createBasicNftSaleEvent('nftId2', '', '', '', '', 5, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 2, 10, '', ''),
                    createBasicNftSaleEvent('nftId2', '', '', '', '', 4, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 1, 10, '', ''),
                ],
                nftEntitiesMap: new Map([
                    ['nftId', createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a')],
                    ['nftId2', createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a')],
                ]),
            },
            fetchNftEventsByNftFilterReturs: null,
            result: {
                nftEventEntities: [
                    createBasicNftSaleEvent('nftId', '', '', '', '', 1, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 2, 10, '', ''),
                ],
                nftEntities: [
                    createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a'),
                ],
                total: 4,
            },
        },
        {
            testName: 'null event array in filter should not filter by event type',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
                nftEventFilterENtity: createNftEventPlatformFilterEntity(null, 0, 10, 0, 10),
            },
            fetchPlatformNftEventsReturns: {
                nftEventEntities: [
                    createBasicNftMintEvent('nftId', '', '', '', '', 5, 10, '', ''),
                    createBasicNftTransferEvent('nftId', '', '', '', '', 2, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 4, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 1, 10, '', ''),
                ],
                nftEntitiesMap: new Map([
                    ['nftId', createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a')],
                ]),
            },
            fetchNftEventsByNftFilterReturs: null,
            result: {
                nftEventEntities: [
                    createBasicNftSaleEvent('nftId', '', '', '', '', 1, 10, '', ''),
                    createBasicNftTransferEvent('nftId', '', '', '', '', 2, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 4, 10, '', ''),
                    createBasicNftMintEvent('nftId', '', '', '', '', 5, 10, '', ''),
                ],
                nftEntities: [
                    createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a'),
                ],
                total: 4,
            },
        },
        {
            testName: 'empty event array in filter should filter out all events types',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
                nftEventFilterENtity: createNftEventPlatformFilterEntity([], 0, 10, 0, 10),
            },
            fetchPlatformNftEventsReturns: {
                nftEventEntities: [
                    createBasicNftMintEvent('nftId', '', '', '', '', 5, 10, '', ''),
                    createBasicNftTransferEvent('nftId', '', '', '', '', 2, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 4, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 1, 10, '', ''),
                ],
                nftEntitiesMap: new Map([
                    ['nftId', createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a')],
                ]),
            },
            fetchNftEventsByNftFilterReturs: null,
            result: {
                nftEventEntities: [
                ],
                nftEntities: [
                ],
                total: 0,
            },
        },
        {
            testName: 'filter mint should return only mint events',
            callParams: {
                userEntity: createBasicUser(1, 1, 'userCudosAddress'),
                nftEventFilterENtity: createNftEventPlatformFilterEntity([NftTransferHistoryEventType.MINT], 0, 10, 0, 10),
            },
            fetchPlatformNftEventsReturns: {
                nftEventEntities: [
                    createBasicNftMintEvent('nftId', '', '', '', '', 5, 10, '', ''),
                    createBasicNftTransferEvent('nftId', '', '', '', '', 2, 10, '', ''),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 4, 10, '', ''),
                    createBasicNftMintEvent('nftId', '', '', '', '', 1, 10, '', ''),
                ],
                nftEntitiesMap: new Map([
                    ['nftId', createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a')],
                ]),
            },
            fetchNftEventsByNftFilterReturs: null,
            result: {
                nftEventEntities: [
                    createBasicNftMintEvent('nftId', '', '', '', '', 1, 10, '', ''),
                    createBasicNftMintEvent('nftId', '', '', '', '', 5, 10, '', ''),
                ],
                nftEntities: [
                    createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a'),
                ],
                total: 2,
            },
        },
    ];

    fetchNftEventsByFilterTestData.forEach((testData: FetchNftEventsByFilterTestData) => it(`fetchNftEventsByFilter: ${testData.testName}`, async () => {
        jest.spyOn(StatisticsService.prototype as any, 'fetchNftEventsByNftFilter').mockImplementation(async () => testData.fetchNftEventsByNftFilterReturs);
        jest.spyOn(StatisticsService.prototype as any, 'fetchPlatformNftEvents').mockImplementation(async () => testData.fetchPlatformNftEventsReturns);

        if (typeof testData.result === 'string') {
            await expect(service.fetchNftEventsByFilter(testData.callParams.userEntity, testData.callParams.nftEventFilterENtity)).rejects.toThrow(new Error(testData.result));
        } else {
            expect(await service.fetchNftEventsByFilter(testData.callParams.userEntity, testData.callParams.nftEventFilterENtity)).toEqual(testData.result)
        }
    }))

    type FetchMegaWalletEventsByFilterTestData = {
        testName: string,
        callParams: MegaWalletEventFilterEntity,
        fetchPlatformNftEventsReturns: {
            nftEventEntities: NftEventEntity[],
            nftEntitiesMap: Map<string, NftEntity>
        },
        fetchMarketplaceCollectionsByDenomIdsReturns: ChainMarketplaceCollectionEntity[],
        collectionServiceFindByDenomIdsResult: CollectionEntity[],
        farmServiceFindMiningFarmByIdsResult: MiningFarmEntity[],
        result: {
            megaWalletEventEntities: MegaWalletEventEntity[],
            nftEntities: NftEntity[],
            total: number
        } | ERROR_TYPES
    }

    const fetchMegaWalletEventsByFilterTestData: FetchMegaWalletEventsByFilterTestData[] = [
        {
            testName: 'invalid timestamp should throw error',
            callParams: createMegaWalletEventFilterEntity([], 10, 1, 0, 10),

            fetchPlatformNftEventsReturns: {
                nftEventEntities: [],
                nftEntitiesMap: new Map(),
            },
            fetchMarketplaceCollectionsByDenomIdsReturns: [],
            collectionServiceFindByDenomIdsResult: [],
            farmServiceFindMiningFarmByIdsResult: [],
            result: ERROR_TYPES.DATA_SERVICE_ERROR,
        },
        {
            testName: 'no fetched events should return empty arrays and zero total',
            callParams: createMegaWalletEventFilterEntity([], 0, 10, 0, 10),
            fetchPlatformNftEventsReturns: {
                nftEventEntities: [
                ],
                nftEntitiesMap: new Map([
                ]),
            },
            fetchMarketplaceCollectionsByDenomIdsReturns: [],
            collectionServiceFindByDenomIdsResult: [],
            farmServiceFindMiningFarmByIdsResult: [],
            result: {
                megaWalletEventEntities: [],
                nftEntities: [],
                total: 0,
            },
        },
        {
            testName: 'events with NOT_EXISTS_STRING price should not be included',
            callParams: createMegaWalletEventFilterEntity([], 0, 10, 0, 10),
            fetchPlatformNftEventsReturns: {
                nftEventEntities: [
                    createBasicNftMintEvent('nftId', '', '', '', '', 5, 10, '', NOT_EXISTS_STRING),
                    createBasicNftTransferEvent('nftId', '', '', '', '', 2, 10, '', NOT_EXISTS_STRING),
                    createBasicNftSaleEvent('nftId', '', '', '', '', 4, 10, '', NOT_EXISTS_STRING),
                    createBasicNftMintEvent('nftId', '', '', '', '', 1, 10, '', NOT_EXISTS_STRING),
                ],
                nftEntitiesMap: new Map([
                    ['nftId', createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a')],
                ]),
            },
            fetchMarketplaceCollectionsByDenomIdsReturns: [],
            collectionServiceFindByDenomIdsResult: [],
            farmServiceFindMiningFarmByIdsResult: [],
            result: {
                megaWalletEventEntities: [],
                nftEntities: [],
                total: 0,
            },
        },
        // {
        //     testName: 'graphql collection not found should throw error',
        //     callParams: createMegaWalletEventFilterEntity([], 0, 10, 0, 10),
        //     fetchPlatformNftEventsReturns: {
        //         nftEventEntities: [
        //             createBasicNftMintEvent('nftId', '', '', '', '', 5, 10, '', '100'),
        //         ],
        //         nftEntitiesMap: new Map([
        //             ['nftId', createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a')],
        //         ]),
        //     },
        //     fetchMarketplaceCollectionsByDenomIdsReturns: [
        //         // createcollection
        //     ],
        //     collectionServiceFindByDenomIdsResult: [],
        //     farmServiceFindMiningFarmByIdsResult: [],
        //     result: ERROR_TYPES.GRAPHQL_COLLECTION_DENOM_NOT_FOUND_ERROR,
        // },
        // {
        //     testName: 'graphql collection not found should throw error',
        //     callParams: createMegaWalletEventFilterEntity([], 0, 10, 0, 10),
        //     fetchPlatformNftEventsReturns: {
        //         nftEventEntities: [
        //             createBasicNftMintEvent('nftId', '', '', '', '', 5, 10, '', NOT_EXISTS_STRING),
        //             createBasicNftTransferEvent('nftId', '', '', '', '', 2, 10, '', NOT_EXISTS_STRING),
        //             createBasicNftSaleEvent('nftId', '', '', '', '', 4, 10, '', NOT_EXISTS_STRING),
        //             createBasicNftMintEvent('nftId', '', '', '', '', 1, 10, '', NOT_EXISTS_STRING),
        //         ],
        //         nftEntitiesMap: new Map([
        //             ['nftId', createBasicMintedNft('nftId', 'a', 1, '100', 'a', 1, 1, 'a', 'a')],
        //         ]),
        //     },
        //     fetchMarketplaceCollectionsByDenomIdsReturns: [],
        //     collectionServiceFindByDenomIdsResult: [],
        //     farmServiceFindMiningFarmByIdsResult: [],
        //     result: {
        //         megaWalletEventEntities: [],
        //         nftEntities: [],
        //         total: 0,
        //     },
        // },
    ]

    fetchMegaWalletEventsByFilterTestData.forEach((testData: FetchMegaWalletEventsByFilterTestData) => it(`fetchMegaWalletEventsByFilter: ${testData.testName}`, async () => {
        jest.spyOn(StatisticsService.prototype as any, 'fetchPlatformNftEvents').mockImplementation(async () => testData.fetchPlatformNftEventsReturns);
        jest.spyOn(GraphqlService.prototype as any, 'fetchMarketplaceCollectionsByDenomIds').mockImplementation(async () => testData.fetchMarketplaceCollectionsByDenomIdsReturns);
        jest.spyOn(CollectionService.prototype as any, 'findByDenomIds').mockImplementation(async () => testData.collectionServiceFindByDenomIdsResult);
        jest.spyOn(FarmService.prototype as any, 'findMiningFarmByIds').mockImplementation(async () => testData.farmServiceFindMiningFarmByIdsResult);

        if (typeof testData.result === 'string') {
            await expect(service.fetchMegaWalletEventsByFilter(testData.callParams)).rejects.toThrow(new Error(testData.result));
        } else {
            expect(await service.fetchMegaWalletEventsByFilter(testData.callParams)).toEqual(testData.result);
        }
    }))
});
