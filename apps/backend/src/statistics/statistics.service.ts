import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import BigNumber from 'bignumber.js';
import sequelize, { LOCK, Op, Transaction } from 'sequelize';
import UserEntity from '../account/entities/user.entity';
import { CollectionService } from '../collection/collection.service';
import ChainMarketplaceCollectionEntity from '../collection/entities/chain-marketplace-collection.entity';
import CollectionFilterEntity from '../collection/entities/collection-filter.entity';
import { CollectionEntity } from '../collection/entities/collection.entity';
import { CollectionDenomNotFoundError, CollectionNotFoundError, DataServiceError } from '../common/errors/errors';
import { IntBoolValue, NOT_EXISTS_STRING } from '../common/utils';
import MiningFarmEntity from '../farm/entities/mining-farm.entity';
import { FarmService } from '../farm/farm.service';
import NftMarketplaceTradeHistoryEntity from '../graphql/entities/nft-marketplace-trade-history.entity';
import NftModuleNftTransferEntity from '../graphql/entities/nft-module-nft-transfer-history';
import { GraphqlService } from '../graphql/graphql.service';
import NftFilterEntity from '../nft/entities/nft-filter.entity';
import NftEntity from '../nft/entities/nft.entity';
import { NFTService } from '../nft/nft.service';
import { AddressPayoutHistoryEntity } from './entities/address-payout-history.entity';
import CollectionPaymentAllocationStatisticsFilter from './entities/collection-payment-allocation-statistics-filter.entity';
import { CollectionPaymentAllocationEntity, CollectionPaymontAllocationEarningType } from './entities/collection-payment-allocation.entity';
import EarningsPerDayFilterEntity from './entities/earnings-per-day-filter.entity';
import EarningsPerDayEntity, { EarningWithTimestampEntity } from './entities/earnings-per-day.entity';
import MegaWalletEventFilterEntity from './entities/mega-wallet-event-filter.entity';
import MegaWalletEventEntity from './entities/mega-wallet-event.entity';
import NftEarningsEntity from './entities/nft-earnings.entity';
import NftEventFilterEntity from './entities/nft-event-filter.entity';
import NftEventEntity from './entities/nft-event.entity';
import { NftOwnersPayoutHistoryEntity } from './entities/nft-owners-payout-history.entity';
import { NftPayoutHistoryEntity } from './entities/nft-payout-history.entity';
import EarningsEntity from './entities/platform-earnings.entity';
import UserEarningsEntity from './entities/user-earnings.entity';
import { AddressesPayoutHistoryRepo, AddressesPayoutHistoryRepoColumn } from './repos/addresses-payout-history.repo';
import { CollectionPaymentAllocationRepo, CollectionPaymentAllocationRepoColumn } from './repos/collection-payment-allocation.repo';

import { NftOwnersPayoutHistoryRepo, NftOwnersPayoutHistoryRepoColumn } from './repos/nft-owners-payout-history.repo';
import { NftPayoutHistoryRepo, NftPayoutHistoryRepoColumn } from './repos/nft-payout-history.repo';

@Injectable()
export class StatisticsService {
    constructor(
        @Inject(forwardRef(() => NFTService))
        private nftService: NFTService,
        @Inject(forwardRef(() => CollectionService))
        private collectionService: CollectionService,
        @Inject(forwardRef(() => FarmService))
        private farmService: FarmService,
        @Inject(forwardRef(() => ConfigService))
        private configService: ConfigService,
        private graphqlService: GraphqlService,
        @InjectModel(NftPayoutHistoryRepo)
        private nftPayoutHistoryRepo: typeof NftPayoutHistoryRepo,
        @InjectModel(NftOwnersPayoutHistoryRepo)
        private nftOwnersPayoutHistoryRepo: typeof NftOwnersPayoutHistoryRepo,
        @InjectModel(AddressesPayoutHistoryRepo)
        private addressesPayoutHistoryRepo: typeof AddressesPayoutHistoryRepo,
        @InjectModel(CollectionPaymentAllocationRepo)
        private collectionPaymentAllocationRepo: typeof CollectionPaymentAllocationRepo,
    ) {}

    // controller functions
    async fetchNftEventsByFilter(userEntity: UserEntity, nftEventFilterEntity: NftEventFilterEntity, dbTx: Transaction, dbLock: LOCK = undefined): Promise<{ nftEventEntities: NftEventEntity[], nftEntities: NftEntity[], total: number }> {
        if (nftEventFilterEntity.isTimestampFilterSet() === true) {
            StatisticsService.checkTimeframe(nftEventFilterEntity.timestampFrom, nftEventFilterEntity.timestampTo);
        }

        const { nftEventEntities, nftEntitiesMap } = nftEventFilterEntity.isPlatformFilter() ? await this.fetchPlatformNftEvents(dbTx, dbLock) : await this.fetchNftEventsByNftFilter(userEntity, nftEventFilterEntity, dbTx, dbLock);

        // nftEventEntities.sort((a, b) => a.timestamp - b.timestamp);
        nftEventEntities.sort((a, b) => b.timestamp - a.timestamp);

        // filter for event type
        let filteredNftEventEntities = nftEventFilterEntity.isEventFilterSet()
            ? nftEventEntities.filter((entity) => nftEventFilterEntity.eventTypes.includes(entity.eventType))
            : nftEventEntities;

        // filter for period
        filteredNftEventEntities = nftEventFilterEntity.isTimestampFilterSet()
            ? filteredNftEventEntities.filter((entity) => entity.timestamp >= nftEventFilterEntity.timestampFrom && entity.timestamp <= nftEventFilterEntity.timestampTo)
            : filteredNftEventEntities;

        // slice
        const total = filteredNftEventEntities.length
        const countPerPage = nftEventFilterEntity.count;
        let from = nftEventFilterEntity.from;
        if (from >= total) {
            from = Math.max(0, countPerPage * Math.floor((total - 1) / countPerPage));
        }
        const slicedFilteredNftEventEntities = filteredNftEventEntities.slice(from, from + nftEventFilterEntity.count);

        // const nftEntities = slicedFilteredNftEventEntities.map((nftEventEntity) => nftEntitiesMap.get(nftEventEntity.nftId));
        const slicedFilteredNftEntitiesMap = new Map < string, NftEntity>();
        slicedFilteredNftEventEntities.forEach((nftEventEntity) => {
            slicedFilteredNftEntitiesMap.set(nftEventEntity.nftId, nftEntitiesMap.get(nftEventEntity.nftId));
        });
        const nftEntities = [];
        slicedFilteredNftEntitiesMap.forEach((nftEntity) => {
            nftEntities.push(nftEntity);
        });

        return {
            nftEventEntities: slicedFilteredNftEventEntities,
            nftEntities,
            total,
        }
    }

    async fetchMegaWalletEventsByFilter(megaWalletEventFilterEntity: MegaWalletEventFilterEntity, dbTx: Transaction, dbLock: LOCK = undefined): Promise<{ megaWalletEventEntities: MegaWalletEventEntity[], nftEntities: NftEntity[], total: number }> {
        if (megaWalletEventFilterEntity.isTimestampFilterSet() === true) {
            StatisticsService.checkTimeframe(megaWalletEventFilterEntity.timestampFrom, megaWalletEventFilterEntity.timestampTo);
        }

        const { nftEventEntities, nftEntitiesMap } = await this.fetchPlatformNftEvents(dbTx, dbLock);

        const filteredNftEntities = nftEventEntities.filter((nftEventEntity) => nftEventEntity.hasPrice() === true);

        let denomIds = filteredNftEntities.map((nftEventEntity) => nftEventEntity.denomId);

        // filter only unique denomids
        denomIds = denomIds.filter((denomId, i) => denomIds.findIndex((value) => value === denomId) === i);
        const marketplaceCollectionEntities = await this.graphqlService.fetchMarketplaceCollectionsByDenomIds(denomIds);

        // if lengths are not equal, it means collection not found. This should never occur
        if (marketplaceCollectionEntities.length !== denomIds.length) {
            throw new CollectionDenomNotFoundError();
        }

        const denomIdMarketplaceCollectionEntityMap = new Map<string, ChainMarketplaceCollectionEntity>();
        marketplaceCollectionEntities.forEach((marketplaceCollectionEntity) => {
            denomIdMarketplaceCollectionEntityMap.set(marketplaceCollectionEntity.denomId, marketplaceCollectionEntity);
        })

        const collectionEntities = await this.collectionService.findByDenomIds(denomIds, dbTx, dbLock);
        // if lengths are not equal, it means collection not found. This should never occur
        if (marketplaceCollectionEntities.length !== denomIds.length) {
            throw new CollectionNotFoundError();
        }

        const farmEntities = await this.farmService.findMiningFarmByIds(collectionEntities.map((collectionEntity) => collectionEntity.farmId), dbTx, dbLock);
        const farmIdFarmMap = new Map();
        farmEntities.forEach((farmEntity) => {
            farmIdFarmMap.set(farmEntity.id, farmEntity);
        })

        const denomIdFarmMap = new Map<string, MiningFarmEntity>();
        collectionEntities.forEach((collectionEntity) => {
            const farmEntity = farmIdFarmMap.get(collectionEntity.farmId);
            denomIdFarmMap.set(collectionEntity.denomId, farmEntity);
        })

        let megaWalletEventEntities = filteredNftEntities.map((nftEventEntity) => {
            return MegaWalletEventEntity.fromNftEventEntity(
                nftEventEntity,
                denomIdMarketplaceCollectionEntityMap.get(nftEventEntity.denomId),
                denomIdFarmMap.get(nftEventEntity.denomId),
            )
        });

        if (megaWalletEventFilterEntity.isSortByTime() === true) {
            megaWalletEventEntities.sort((a, b) => (a.timestamp - b.timestamp) * megaWalletEventFilterEntity.sortBy);
        }

        // filter for event type
        megaWalletEventEntities = megaWalletEventFilterEntity.isEventFilterSet()
            ? megaWalletEventEntities.filter((entity) => {
                return megaWalletEventFilterEntity.eventTypes.includes(entity.eventType)
            })
            : megaWalletEventEntities;

        // filter for period
        megaWalletEventEntities = megaWalletEventFilterEntity.isTimestampFilterSet()
            ? megaWalletEventEntities.filter((entity) => entity.timestamp >= megaWalletEventFilterEntity.timestampFrom && entity.timestamp <= megaWalletEventFilterEntity.timestampTo)
            : megaWalletEventEntities;

        // slice
        const total = filteredNftEntities.length;
        const countPerPage = megaWalletEventFilterEntity.count;
        let from = megaWalletEventFilterEntity.from;
        if (from >= total) {
            from = Math.max(0, countPerPage * Math.floor((total - 1) / countPerPage));
        }

        megaWalletEventEntities = megaWalletEventEntities.slice(from, from + megaWalletEventFilterEntity.count);

        // const nftEntities = megaWalletEventEntities.map((nftEventEntity) => nftEntitiesMap.get(nftEventEntity.nftId));
        const slicedFilteredNftEntitiesMap = new Map < string, NftEntity>();
        megaWalletEventEntities.forEach((nftEventEntity) => {
            slicedFilteredNftEntitiesMap.set(nftEventEntity.nftId, nftEntitiesMap.get(nftEventEntity.nftId));
        });
        const nftEntities = [];
        slicedFilteredNftEntitiesMap.forEach((nftEntity) => {
            nftEntities.push(nftEntity);
        });

        return {
            megaWalletEventEntities,
            nftEntities,
            total,
        }
    }

    async fetchEarningsByCudosAddress(cudosAddress: string, timestampFrom: number, timestampTo: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < UserEarningsEntity > {
        StatisticsService.checkTimeframe(timestampFrom, timestampTo);

        const earningsPerDayEntity = new EarningsPerDayEntity(timestampFrom, timestampTo);
        const nftOwnersPayoutHistoryEntities = await this.fetchNftOwnersPayoutHistoryByCudosAddress(cudosAddress, timestampFrom, timestampTo, dbTx, dbLock);
        earningsPerDayEntity.calculateEarningsByNftOwnersPayoutHistory(nftOwnersPayoutHistoryEntities);

        const sqlRow = await this.nftOwnersPayoutHistoryRepo.findOne({
            where: {
                [NftOwnersPayoutHistoryRepoColumn.OWNER]: cudosAddress,
                [NftOwnersPayoutHistoryRepoColumn.SENT]: true,
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col(NftOwnersPayoutHistoryRepoColumn.REWARD)), 'sumOfRewards'],
            ],
            transaction: dbTx,
            lock: dbLock,
        });
        const sumOfRewards = sqlRow.getDataValue('sumOfRewards');
        const totalEarningInBtc = new BigNumber(sumOfRewards ?? 0);

        const activeNftEntities = await this.nftService.findActiveByCurrentOwner(cudosAddress, dbTx, dbLock);
        const totalContractHashPowerInTh = activeNftEntities.reduce((acc, nftEntity) => {
            return acc + nftEntity.hashingPower;
        }, 0);

        const userEarningsEntity = new UserEarningsEntity();
        userEarningsEntity.totalEarningInBtc = totalEarningInBtc;
        userEarningsEntity.totalNftBought = activeNftEntities.length;
        userEarningsEntity.totalContractHashPowerInTh = totalContractHashPowerInTh;
        userEarningsEntity.earningsPerDayInBtc = earningsPerDayEntity.earningsPerDay;
        userEarningsEntity.btcEarnedInBtc = earningsPerDayEntity.sumEarnings();

        return userEarningsEntity;
    }

    async fetchEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < NftEarningsEntity > {
        StatisticsService.checkTimeframe(timestampFrom, timestampTo);

        const earningsPerDayEntity = new EarningsPerDayEntity(timestampFrom, timestampTo);

        const nftEntity = await this.nftService.findOne(nftId, dbTx, dbLock);
        if (nftEntity.isMinted() === true) {
            const nftPayoutHistoryEntities = await this.fetchPayoutHistoryByTokenId(nftEntity.getTokenIdAsInt(), dbTx, dbLock);
            const nftPayoutHistoryIds = nftPayoutHistoryEntities.map((nftPayoutHistoryEntity) => nftPayoutHistoryEntity.id);
            const nftOwnersPayoutHistoryEntities = await this.fetchNftOwnersPayoutHistoryByPayoutHistoryIds(nftPayoutHistoryIds, timestampFrom, timestampTo, dbTx, dbLock);
            earningsPerDayEntity.calculateEarningsByNftOwnersPayoutHistory(nftOwnersPayoutHistoryEntities);
        }

        const nftEarningsEntity = new NftEarningsEntity();
        nftEarningsEntity.earningsPerDayInBtc = earningsPerDayEntity.earningsPerDay;
        return nftEarningsEntity;
    }

    async fetchEarningsPerDay(earningsPerDayFilterEntity: EarningsPerDayFilterEntity, dbTx: Transaction, dbLock: LOCK = undefined): Promise < EarningsEntity > {
        const timestampFrom = earningsPerDayFilterEntity.timestampFrom;
        const timestampTo = earningsPerDayFilterEntity.timestampTo;
        StatisticsService.checkTimeframe(timestampFrom, timestampTo);

        const collectionFilterModel = new CollectionFilterEntity();

        if (earningsPerDayFilterEntity.isFarmIdSet() === true) {
            collectionFilterModel.farmId = earningsPerDayFilterEntity.farmId;
        }

        if (earningsPerDayFilterEntity.isCollectionIdSet() === true) {
            collectionFilterModel.collectionIds = earningsPerDayFilterEntity.collectionIds
        }

        const { collectionEntities } = await this.collectionService.findByFilter(collectionFilterModel, dbTx, dbLock);
        const collectionIdEntityMap = new Map<number, CollectionEntity>();
        collectionEntities.forEach((entity) => {
            collectionIdEntityMap.set(entity.id, entity)
        })

        let acudosEarningsPerDay = [];
        if (earningsPerDayFilterEntity.shouldFetchCudosEarnings() === true) {
            acudosEarningsPerDay = await this.fetchCudosEarningsForNfts(collectionEntities, earningsPerDayFilterEntity, dbTx, dbLock)
        }

        let btcEarningsPerDay = [];
        if (earningsPerDayFilterEntity.shouldFetchBtcEarnings() === true) {
            btcEarningsPerDay = await this.fetchBtcEarnings(earningsPerDayFilterEntity, dbTx, dbLock)
        }

        const earningsEntity = new EarningsEntity();
        earningsEntity.acudosEarningsPerDay = acudosEarningsPerDay;
        earningsEntity.btcEarningsPerDay = btcEarningsPerDay;
        return earningsEntity
    }

    async fetchTotalBtcEarned(collectionPaymentStatisticsFilter: CollectionPaymentAllocationStatisticsFilter, dbTx: Transaction, dbLock: LOCK = undefined): Promise < BigNumber > {
        const addressPayoutHistoryEntities = await this.fetchCollectionPaymentStatistics(collectionPaymentStatisticsFilter, dbTx, dbLock);

        if (collectionPaymentStatisticsFilter.isForPlatform()) {
            if (collectionPaymentStatisticsFilter.isTypeEarnings()) {
                return addressPayoutHistoryEntities.reduce((acc: BigNumber, entity) => acc.plus(entity.cudoGeneralFeeBtc), new BigNumber(0));
            }

            if (collectionPaymentStatisticsFilter.isTypeMaintenanceFee()) {
                return addressPayoutHistoryEntities.reduce((acc: BigNumber, entity) => acc.plus(entity.cudoMaintenanceFeeBtc), new BigNumber(0));
            }
        } else {
            if (collectionPaymentStatisticsFilter.isTypeEarnings()) {
                return addressPayoutHistoryEntities.reduce((acc: BigNumber, entity) => acc.plus(entity.farmUnsoldLeftoverFeeBtc), new BigNumber(0));
            }

            if (collectionPaymentStatisticsFilter.isTypeMaintenanceFee()) {
                return addressPayoutHistoryEntities.reduce((acc: BigNumber, entity) => acc.plus(entity.farmMaintenanceFeeBtc), new BigNumber(0));
            }
        }

        throw Error('Didn\'t enter any type of fetch case.');
    }

    async fetchTotalCudosRoyalties(farmId: string | null, collectionId: string | null, dbTx: Transaction, dbLock: LOCK = undefined): Promise< { mintRoyalties: BigNumber, resaleRoyalties: BigNumber } > {
        const isForPlatform = farmId === null;
        const collectionFilterEntity = new CollectionFilterEntity();
        if (isForPlatform === false) {
            collectionFilterEntity.farmId = farmId;
            if (collectionId !== NOT_EXISTS_STRING) {
                collectionFilterEntity.collectionIds = [collectionId];
            }
        }

        const { collectionEntities } = await this.collectionService.findByFilter(collectionFilterEntity, dbTx, dbLock);

        const denomIds = collectionEntities.map((collectionEntity) => collectionEntity.denomId);

        // fetch marketplace collections for the royalties data
        const marketplaceCollectionEntities = await this.graphqlService.fetchMarketplaceCollectionsByDenomIds(denomIds);
        const denomIdMarketplaceCollectionEntityMap = new Map<string, ChainMarketplaceCollectionEntity>();
        marketplaceCollectionEntities.forEach((collectionEntity) => {
            denomIdMarketplaceCollectionEntityMap.set(collectionEntity.denomId, collectionEntity);
        })

        // fetch all events for those nfts
        const nftMarketplaceEventEntities = await this.graphqlService.fetchMarketplaceNftTradeHistoryByDenomIds(denomIds);
        const nftEventEntities = nftMarketplaceEventEntities.map((nftMarketplaceTradeHistoryEventEntity) => NftEventEntity.fromNftMarketplaceTradeHistory(nftMarketplaceTradeHistoryEventEntity));

        // filter events by minted and by resale
        const nftMintEventEntities = nftEventEntities.filter((nftEventEntity: NftEventEntity) => nftEventEntity.isMintEvent() === true);
        const nftSaleEventEntities = nftEventEntities.filter((nftEventEntity: NftEventEntity) => nftEventEntity.isSaleEvent() === true);

        const mintRoyaltiEntries: BigNumber[] = [];

        // calculate minted royalties and resale royalties
        nftMintEventEntities.forEach((nftEventEntity) => {
            const marketplaceCollectionEntity = denomIdMarketplaceCollectionEntityMap.get(nftEventEntity.denomId);

            if (!marketplaceCollectionEntity) {
                throw Error(`Missing collection for nft denom id: ${nftEventEntity.denomId}`);
            }

            const royaltiesAddress = isForPlatform === true ? marketplaceCollectionEntity.platformRoyaltiesAddress : marketplaceCollectionEntity.farmMintRoyaltiesAddress;
            const royaltiesPercent = marketplaceCollectionEntity.getMintRoyaltiesPercent(royaltiesAddress);

            if (!royaltiesPercent) {
                throw Error('Missing royalties percent,');
            }

            const earningsFromMint = nftEventEntity.transferPriceInAcudos.multipliedBy(royaltiesPercent / 100);
            mintRoyaltiEntries.push(earningsFromMint);
        });

        const resaleRoyaltiEntries: BigNumber[] = [];
        nftSaleEventEntities.forEach((nftEventEntity) => {
            const marketplaceCollectionEntity = denomIdMarketplaceCollectionEntityMap.get(nftEventEntity.denomId);

            if (!marketplaceCollectionEntity) {
                throw Error(`Missing collection for nft denom id: ${nftEventEntity.denomId}`);
            }

            const royaltiesAddress = isForPlatform === true ? marketplaceCollectionEntity.platformRoyaltiesAddress : marketplaceCollectionEntity.farmResaleRoyaltiesAddress;
            const royaltiesPercent = marketplaceCollectionEntity.getResaleRoyaltiesPercent(royaltiesAddress);
            if (!royaltiesPercent) {
                throw Error('Missing royalties percent,');
            }

            const earningFromResale = nftEventEntity.transferPriceInAcudos.multipliedBy(royaltiesPercent / 100);
            resaleRoyaltiEntries.push(earningFromResale);
        });

        const mintRoyalties = mintRoyaltiEntries.reduce((acc: BigNumber, nextValue) => acc.plus(nextValue), new BigNumber(0));
        const resaleRoyalties = resaleRoyaltiEntries.reduce((acc: BigNumber, nextValue) => acc.plus(nextValue), new BigNumber(0));

        return { mintRoyalties, resaleRoyalties };
    }

    async fetchUsersSpendingOnPlatformInUsd(userEntity: UserEntity, dbTx: Transaction, dbLock: LOCK = undefined): Promise < number > {
        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.sessionAccount = IntBoolValue.TRUE;

        const processedMintEventNftIdSet = new Set();
        const { nftEventEntities } = await this.fetchNftEventsByFilter(userEntity, nftEventFilterEntity, dbTx, dbLock);
        const sumInUsd = nftEventEntities.filter((nftEventEntity) => {
            if (nftEventEntity.isMintEvent() === false && nftEventEntity.isSaleEvent() === false) {
                return false;
            }

            if (nftEventEntity.isMintEvent() === true && processedMintEventNftIdSet.has(nftEventEntity.nftId) === true) {
                return false;
            }

            const result = nftEventEntity.toAddress === userEntity.cudosWalletAddress;
            if (result === true && nftEventEntity.isMintEvent() === true) {
                processedMintEventNftIdSet.add(nftEventEntity.nftId);
            }

            return result;
        }).reduce((accumulator, nftEventEntity) => {
            return accumulator + nftEventEntity.transferPriceInUsd;
        }, 0);

        return Number(sumInUsd.toFixed(0));
    }

    private async fetchPlatformNftEvents(dbTx: Transaction, dbLock: LOCK = undefined): Promise < {nftEventEntities: NftEventEntity[], nftEntitiesMap: Map<string, NftEntity>} > {
        const { collectionEntities } = await this.collectionService.findByFilter(new CollectionFilterEntity(), dbTx, dbLock);
        const denomIdsPre = collectionEntities.map((collection) => collection.denomId);

        // fetch all events from graphql
        const nftModuleNftTransferEntities = await this.graphqlService.fetchNftTransferHistoryByDenomIds(denomIdsPre);
        const nftMarketplaceTradeEntities = await this.graphqlService.fetchMarketplaceNftTradeHistoryByDenomIds(denomIdsPre);

        // get denom and token ids for query from db
        let denomIds = nftModuleNftTransferEntities.map((entity) => entity.denomId);
        denomIds = denomIds.concat(nftMarketplaceTradeEntities.map((entity) => entity.denomId));
        denomIds = denomIds.filter((denomId, i) => denomIds.findIndex((id) => id === denomId) === i);

        let tokenIds = nftModuleNftTransferEntities.map((entity) => entity.tokenId);
        tokenIds = tokenIds.concat(nftMarketplaceTradeEntities.map((entity) => entity.tokenId));
        tokenIds = tokenIds.filter((tokenId, i) => tokenIds.findIndex((id) => id === tokenId) === i);

        // filter out collections that are not in graph ql
        const collections = collectionEntities.filter((collectionEntity) => denomIds.includes(collectionEntity.denomId));

        // get collections so we can query nfts by collection ids
        const collectionIdCollectionMap = new Map<number, CollectionEntity>();
        collections.forEach((entity) => collectionIdCollectionMap.set(entity.id, entity));

        // get nfts by collection ids and token ids
        const nfts = await this.nftService.findByCollectionIdsAndTokenIds(
            collections.map((entity) => entity.id),
            tokenIds,
            dbTx,
            dbLock,
        );

        // create a map for faster mapping of the graph ql values
        const denomIdTokenIdNftsMap = new Map<string, Map<string, NftEntity>>();
        nfts.forEach((nftEntity) => {
            const collectionEntity: CollectionEntity = collectionIdCollectionMap.get(nftEntity.collectionId);

            const nftMap: Map<string, NftEntity> = denomIdTokenIdNftsMap.has(collectionEntity.denomId)
                ? denomIdTokenIdNftsMap.get(collectionEntity.denomId)
                : new Map<string, NftEntity>();

            nftMap.set(nftEntity.tokenId, nftEntity);
            denomIdTokenIdNftsMap.set(collectionEntity.denomId, nftMap);
        })

        const nftEventEntities: NftEventEntity[] = [];

        nftModuleNftTransferEntities.forEach((nftModuleNftTransferEntity: NftModuleNftTransferEntity) => {
            const nftMapForDenom = denomIdTokenIdNftsMap.get(nftModuleNftTransferEntity.denomId);
            if (!nftMapForDenom) {
                return;
            }

            const nftId = nftMapForDenom.get(nftModuleNftTransferEntity.tokenId)?.id;

            if (!nftId) {
                return;
            }

            const nftEventEntity = NftEventEntity.fromNftModuleTransferHistory(nftModuleNftTransferEntity);
            nftEventEntity.nftId = nftId;

            if (nftEventEntity.isMintEvent() === false) {
                nftEventEntities.push(nftEventEntity);
            }
        });

        nftMarketplaceTradeEntities.forEach((nftMarketplaceTradeHistoryEntity: NftMarketplaceTradeHistoryEntity) => {
            const nftMapForDenom = denomIdTokenIdNftsMap.get(nftMarketplaceTradeHistoryEntity.denomId);
            if (!nftMapForDenom) {
                return;
            }

            const nftId = nftMapForDenom.get(nftMarketplaceTradeHistoryEntity.tokenId)?.id;

            if (!nftId) {
                return;
            }

            const nftEventEntity = NftEventEntity.fromNftMarketplaceTradeHistory(nftMarketplaceTradeHistoryEntity);
            nftEventEntity.nftId = nftId;

            nftEventEntities.push(nftEventEntity);
        });

        // make maps for faster filter later
        const nftEntitiesMap = new Map<string, NftEntity>();
        nfts.forEach((nftEntity) => {
            nftEntitiesMap.set(nftEntity.id, nftEntity);
        })

        return {
            nftEventEntities,
            nftEntitiesMap,
        }
    }

    private async fetchNftEventsByNftFilter(userEntity: UserEntity, nftEventFilterEntity: NftEventFilterEntity, dbTx: Transaction, dbLock: LOCK = undefined): Promise< {nftEventEntities: NftEventEntity[], nftEntitiesMap: Map<string, NftEntity> } > {
        if (nftEventFilterEntity.isTimestampFilterSet() === true) {
            StatisticsService.checkTimeframe(nftEventFilterEntity.timestampFrom, nftEventFilterEntity.timestampTo);
        }

        const timestampFrom = nftEventFilterEntity.isTimestampFilterSet() === true ? nftEventFilterEntity.timestampFrom : 0;
        const timestampTo = nftEventFilterEntity.isTimestampFilterSet() === true ? nftEventFilterEntity.timestampTo : Number.MAX_SAFE_INTEGER;

        let nftmoduleNftTransferEntities;
        let nftmarketplaceTradeEntities;
        if (nftEventFilterEntity.isBySessionAccount()) {
            // get all events by user address and timestamp
            nftmoduleNftTransferEntities = await this.graphqlService.fetchNftTransferHistoryByAddressAndTimestamp(timestampFrom, timestampTo, userEntity.cudosWalletAddress);
            nftmarketplaceTradeEntities = await this.graphqlService.fetchMarketplaceNftTradeHistoryByAddressAndTimestamp(timestampFrom, timestampTo, userEntity.cudosWalletAddress);
        } else if (nftEventFilterEntity.isByMiningFarmId()) {
            const collectionEntities = await this.collectionService.findByFarmId(parseInt(nftEventFilterEntity.miningFarmId), dbTx, dbLock);
            const collectionIdMap = new Map<number, CollectionEntity>();
            collectionEntities.forEach((entity) => {
                collectionIdMap.set(entity.id, entity);
            })
            const nftEntities = await this.nftService.findByCollectionIds(collectionEntities.map((collectionEntity) => collectionEntity.id), dbTx, dbLock);

            if (nftEntities.length === 0) {
                throw Error('No NFTs found for that farm');
            }

            const uniqIds = nftEntities.map((entity) => {
                const collectionEntity = collectionIdMap.get(entity.collectionId);
                return `${entity.tokenId}@${collectionEntity.denomId}`;
            });

            nftmoduleNftTransferEntities = await this.graphqlService.fetchNftTransferHistoryByUniqueIdsAndTimestamp(timestampFrom, timestampTo, uniqIds);
            nftmarketplaceTradeEntities = await this.graphqlService.fetchMarketplaceNftTradeHistoryByUniqueIdsAndTimestamp(timestampFrom, timestampTo, uniqIds);
        } else if (nftEventFilterEntity.isByNftId()) {
            const nftFilterEntity = new NftFilterEntity();
            nftFilterEntity.nftIds = [nftEventFilterEntity.nftId];
            const { nftEntities } = await this.nftService.findByFilter(null, nftFilterEntity, dbTx, dbLock);

            if (nftEntities.length === 0) {
                throw Error('No NFT found with that id');
            }

            const collectionEntites = await this.collectionService.findByCollectionIds([nftEntities[0].collectionId], dbTx, dbLock);
            if (collectionEntites.length === 0) {
                throw Error('No Collection found with that id');
            }

            const uniqIds = [`${nftEntities[0].tokenId}@${collectionEntites[0].denomId}`];

            nftmoduleNftTransferEntities = await this.graphqlService.fetchNftTransferHistoryByUniqueIdsAndTimestamp(timestampFrom, timestampTo, uniqIds);
            nftmarketplaceTradeEntities = await this.graphqlService.fetchMarketplaceNftTradeHistoryByUniqueIdsAndTimestamp(timestampFrom, timestampTo, uniqIds);
        }

        // get all nfts per the found events
        const collectionFilterEntity = new CollectionFilterEntity();
        collectionFilterEntity.denomIds = nftmoduleNftTransferEntities
            .map((entity) => entity.denomId)
            .concat(nftmarketplaceTradeEntities.map((entity) => entity.denomId));

        const { collectionEntities } = await this.collectionService.findByFilter(collectionFilterEntity, dbTx, dbLock);
        const collectionIdCollectionMap = new Map<number, CollectionEntity>();
        collectionEntities.forEach((collectionEntity) => {
            collectionIdCollectionMap.set(collectionEntity.id, collectionEntity);
        })

        const nftFilterEntity = new NftFilterEntity();
        nftFilterEntity.tokenIds = nftmoduleNftTransferEntities
            .map((entity) => entity.tokenId)
            .concat(nftmarketplaceTradeEntities.map((entity) => entity.tokenId));
        nftFilterEntity.collectionIds = collectionEntities.map((entity) => entity.id.toString());
        const { nftEntities } = await this.nftService.findByFilter(userEntity, nftFilterEntity, dbTx, dbLock)

        const denomIdTokenIdNftENtityMap = new Map<string, Map<string, NftEntity>>();
        nftEntities.forEach((nftEntity: NftEntity) => {
            // add tokenId nftentity map if not exists
            const collectionEntity = collectionIdCollectionMap.get(nftEntity.collectionId);
            if (denomIdTokenIdNftENtityMap.has(collectionEntity.denomId) === false) {
                denomIdTokenIdNftENtityMap.set(collectionEntity.denomId, new Map<string, NftEntity>());
            }

            const tokenIdNftEntityMap = denomIdTokenIdNftENtityMap.get(collectionEntity.denomId);
            tokenIdNftEntityMap.set(nftEntity.tokenId, nftEntity);
        })

        // filter the events by the fitlers for the nft entities
        const nftEventEntities: NftEventEntity[] = [];
        nftmoduleNftTransferEntities.forEach((nftModuleNftTransferEntity: NftModuleNftTransferEntity) => {
            const nftEntity = denomIdTokenIdNftENtityMap.get(nftModuleNftTransferEntity.denomId)?.get(nftModuleNftTransferEntity.tokenId)
            if (nftEntity === undefined) {
                return;
            }

            const nftTransferHistoryEntity = NftEventEntity.fromNftModuleTransferHistory(nftModuleNftTransferEntity);
            nftTransferHistoryEntity.nftId = nftEntity.id;
            // removing nft module mint events, they are redundand
            if (nftTransferHistoryEntity.isMintEvent() === false) {
                nftEventEntities.push(nftTransferHistoryEntity);
            }
        })

        nftmarketplaceTradeEntities.forEach((nftMarketplaceTradeHistoryEntity: NftMarketplaceTradeHistoryEntity) => {
            const nftEntity = denomIdTokenIdNftENtityMap.get(nftMarketplaceTradeHistoryEntity.denomId)?.get(nftMarketplaceTradeHistoryEntity.tokenId);
            if (nftEntity === undefined) {
                return;
            }

            const nftTransferHistoryEntity = NftEventEntity.fromNftMarketplaceTradeHistory(nftMarketplaceTradeHistoryEntity);
            nftTransferHistoryEntity.nftId = nftEntity.id;
            nftEventEntities.push(nftTransferHistoryEntity);

        })

        const nftEntitiesMap = new Map<string, NftEntity>();
        nftEntities.forEach((nftEntity) => {
            nftEntitiesMap.set(nftEntity.id, nftEntity);
        })

        return {
            nftEventEntities,
            nftEntitiesMap,
        }
    }

    private async fetchCudosEarningsForNfts(collectionEntities: CollectionEntity[], earningsPerDayFilterEntity: EarningsPerDayFilterEntity, dbTx: Transaction, dbLock: LOCK = undefined): Promise< BigNumber[] > {
        const denomIds = collectionEntities.map((collectionEntity) => collectionEntity.denomId);

        // fetch marketplace collections for the royalties data
        const marketplaceCollectionEntities = await this.graphqlService.fetchMarketplaceCollectionsByDenomIds(denomIds);
        const denomIdMarketplaceCollectionEntityMap = new Map<string, ChainMarketplaceCollectionEntity>();
        marketplaceCollectionEntities.forEach((collectionEntity) => {
            denomIdMarketplaceCollectionEntityMap.set(collectionEntity.denomId, collectionEntity);
        })

        // fetch all events for those nfts
        let nftMarketplaceEventEntities = await this.graphqlService.fetchMarketplaceNftTradeHistoryByDenomIds(denomIds);
        nftMarketplaceEventEntities = nftMarketplaceEventEntities.filter((eventEntity) => eventEntity.timestamp <= earningsPerDayFilterEntity.timestampTo && eventEntity.timestamp >= earningsPerDayFilterEntity.timestampFrom)
        const nftEventEntities = nftMarketplaceEventEntities.map((nftMarketplaceTradeHistoryEventEntity) => NftEventEntity.fromNftMarketplaceTradeHistory(nftMarketplaceTradeHistoryEventEntity));

        // filter events by minted and by resale
        const nftMintEventEntities = nftEventEntities.filter((nftEventEntity: NftEventEntity) => nftEventEntity.isMintEvent() === true);
        const nftSaleEventEntities = nftEventEntities.filter((nftEventEntity: NftEventEntity) => nftEventEntity.isSaleEvent() === true);

        const timestampEarningEntities: EarningWithTimestampEntity[] = [];

        // calculate minted royalties and resale royalties
        nftMintEventEntities.forEach((nftEventEntity) => {
            const marketplaceCollectionEntity = denomIdMarketplaceCollectionEntityMap.get(nftEventEntity.denomId);

            if (!marketplaceCollectionEntity) {
                throw Error(`Missing collection for nft denom id: ${nftEventEntity.denomId}`);
            }

            const royaltiesAddress = earningsPerDayFilterEntity.isEarningsReceiverPlatform() ? marketplaceCollectionEntity.platformRoyaltiesAddress : marketplaceCollectionEntity.farmMintRoyaltiesAddress;
            const royaltiesPercent = marketplaceCollectionEntity.getMintRoyaltiesPercent(royaltiesAddress);
            if (!royaltiesPercent) {
                throw Error('Missing royalties percent,');
            }

            const mintPrice = nftEventEntity.transferPriceInAcudos;
            timestampEarningEntities.push(new EarningWithTimestampEntity(nftEventEntity.timestamp, mintPrice.multipliedBy(royaltiesPercent / 100)));
        });

        nftSaleEventEntities.forEach((nftEventEntity) => {
            const marketplaceCollectionEntity = denomIdMarketplaceCollectionEntityMap.get(nftEventEntity.denomId);

            if (!marketplaceCollectionEntity) {
                throw Error(`Missing collection for nft denom id: ${nftEventEntity.denomId}`);
            }

            const royaltiesAddress = earningsPerDayFilterEntity.isEarningsReceiverPlatform() ? marketplaceCollectionEntity.platformRoyaltiesAddress : marketplaceCollectionEntity.farmResaleRoyaltiesAddress;
            const royaltiesPercent = marketplaceCollectionEntity.getResaleRoyaltiesPercent(royaltiesAddress);
            if (!royaltiesPercent) {
                throw Error('Missing royalties percent,');
            }

            const earningFromResale = nftEventEntity.transferPriceInAcudos.multipliedBy(royaltiesPercent / 100);
            timestampEarningEntities.push(new EarningWithTimestampEntity(nftEventEntity.timestamp, earningFromResale));
        });

        // calculate earnings per day in acudos
        const earningsPerDayEntity = new EarningsPerDayEntity(earningsPerDayFilterEntity.timestampFrom, earningsPerDayFilterEntity.timestampTo);
        earningsPerDayEntity.calculateEarningsByTimestampEarningEntities(timestampEarningEntities);

        return earningsPerDayEntity.earningsPerDay
    }

    private async fetchBtcEarnings(earningsPerDayFilterEntity: EarningsPerDayFilterEntity, dbTx: Transaction, dbLock: LOCK = undefined): Promise < BigNumber[] > {
        let address = null;

        if (earningsPerDayFilterEntity.isCollectionIdSet() === true) {
            const collectionpaymentAllocationFilterEntity = new CollectionPaymentAllocationStatisticsFilter();
            collectionpaymentAllocationFilterEntity.collectionId = Number(earningsPerDayFilterEntity.collectionIds[0]);
            collectionpaymentAllocationFilterEntity.timestampFrom = earningsPerDayFilterEntity.timestampFrom;
            collectionpaymentAllocationFilterEntity.timestampTo = earningsPerDayFilterEntity.timestampTo;

            const collectionPaymentAllocations = await this.fetchCollectionPaymentStatistics(collectionpaymentAllocationFilterEntity, dbTx, dbLock);
            const earningsPerDayEntity = new EarningsPerDayEntity(earningsPerDayFilterEntity.timestampFrom, earningsPerDayFilterEntity.timestampTo);
            earningsPerDayEntity.calculateEarningsByCollectionPaymentAllocations(collectionPaymentAllocations, CollectionPaymontAllocationEarningType.FARM_UNSOLD_LEFTOVER_FEE);

            return earningsPerDayEntity.earningsPerDay;
        }

        if (earningsPerDayFilterEntity.isEarningsReceiverFarm() === true) {
            const farm = await this.farmService.findMiningFarmById(parseInt(earningsPerDayFilterEntity.farmId), dbTx, dbLock);

            if (!farm) {
                throw Error(`Farm not found by ID: ${earningsPerDayFilterEntity.farmId}`);
            }

            address = farm.leftoverRewardsBtcAddress;
        }

        if (earningsPerDayFilterEntity.isEarningsReceiverPlatform() === true) {
            address = this.configService.getOrThrow('APP_CUDOS_BTC_FEE_PAYOUT_ADDRESS')
        }

        if (address === null) {
            throw Error('Address not set.');
        }

        const addressPayoutHistoryForPeriod = await this.fetchAddressesPayoutHistoryByPayoutAddress(address, earningsPerDayFilterEntity.timestampFrom, earningsPerDayFilterEntity.timestampTo, dbTx, dbLock);
        const earningsPerDayEntity = new EarningsPerDayEntity(earningsPerDayFilterEntity.timestampFrom, earningsPerDayFilterEntity.timestampTo);
        earningsPerDayEntity.calculateEarningsByAddressPayoutHistory(addressPayoutHistoryForPeriod);

        return earningsPerDayEntity.earningsPerDay;
    }

    private async fetchCollectionPaymentStatistics(collectionPaymentStatisticsFilter: CollectionPaymentAllocationStatisticsFilter, dbTx: Transaction, dbLock: LOCK = undefined): Promise < CollectionPaymentAllocationEntity[] > {
        const whereClause: any = {};

        if (collectionPaymentStatisticsFilter.isFarmIdSet()) {
            whereClause[CollectionPaymentAllocationRepoColumn.FARM_ID] = collectionPaymentStatisticsFilter.farmId;
        }

        if (collectionPaymentStatisticsFilter.isCollectionIdSet()) {
            whereClause[CollectionPaymentAllocationRepoColumn.COLLECTION_ID] = collectionPaymentStatisticsFilter.collectionId;
        }

        if (collectionPaymentStatisticsFilter.isTimestampSet()) {
            whereClause[CollectionPaymentAllocationRepoColumn.CREATED_AT] = {
                [Op.gte]: new Date(collectionPaymentStatisticsFilter.timestampFrom),
                [Op.lte]: new Date(collectionPaymentStatisticsFilter.timestampTo),
            }
        }

        const collectionPaymentAllocationRepos = await this.collectionPaymentAllocationRepo.findAll({
            where: whereClause,
            transaction: dbTx,
            lock: dbLock,
        });

        return collectionPaymentAllocationRepos.map((collectionPaymentAllocationRepo) => {
            return CollectionPaymentAllocationEntity.fromRepo(collectionPaymentAllocationRepo);
        });
    }

    private async fetchNftOwnersPayoutHistoryByCudosAddress(cudosAddress: string, timestampFrom: number, timestampTo: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < NftOwnersPayoutHistoryEntity[] > {
        const nftOwnersPayoutHistoryRepos = await this.nftOwnersPayoutHistoryRepo.findAll({
            where: {
                [NftOwnersPayoutHistoryRepoColumn.OWNER]: cudosAddress,
                [NftOwnersPayoutHistoryRepoColumn.CREATED_AT]: {
                    [Op.gte]: new Date(timestampFrom),
                    [Op.lte]: new Date(timestampTo),
                },
                [NftOwnersPayoutHistoryRepoColumn.SENT]: true,
            },
            transaction: dbTx,
            lock: dbLock,
        });

        return nftOwnersPayoutHistoryRepos.map((nftOwnersPayoutHistoryRepo) => {
            return NftOwnersPayoutHistoryEntity.fromRepo(nftOwnersPayoutHistoryRepo);
        });
    }

    private async fetchAddressesPayoutHistoryByPayoutAddress(btcAddress: string, timestampFrom: number, timestampTo: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < AddressPayoutHistoryEntity[] > {
        const addressesPayoutHistoryRepos = await this.addressesPayoutHistoryRepo.findAll({
            where: {
                [AddressesPayoutHistoryRepoColumn.ADDRESS]: btcAddress,
                [AddressesPayoutHistoryRepoColumn.PAYOUT_TIME]: {
                    [Op.gte]: timestampFrom / 1000,
                    [Op.lte]: timestampTo / 1000,
                },
                [AddressesPayoutHistoryRepoColumn.THRESHOLD_REACHED]: true,
            },
            transaction: dbTx,
            lock: dbLock,
        });

        return addressesPayoutHistoryRepos.map((adressPayoutHistoryRepo) => {
            return AddressPayoutHistoryEntity.fromRepo(adressPayoutHistoryRepo);
        });
    }

    private async fetchNftOwnersPayoutHistoryByPayoutHistoryIds(nftPayoutHistoryIds: number[], timestampFrom: number, timestampTo: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < NftOwnersPayoutHistoryEntity[] > {
        const nftOwnersPayoutHistoryRepos = await this.nftOwnersPayoutHistoryRepo.findAll({
            where: {
                [NftOwnersPayoutHistoryRepoColumn.NFT_PAYOUT_HISTORY_ID]: nftPayoutHistoryIds,
                [NftOwnersPayoutHistoryRepoColumn.CREATED_AT]: {
                    [Op.gte]: new Date(timestampFrom),
                    [Op.lte]: new Date(timestampTo),
                },
                [NftOwnersPayoutHistoryRepoColumn.SENT]: true,
            },
            transaction: dbTx,
            lock: dbLock,
        });
        return nftOwnersPayoutHistoryRepos.map((nftOwnersPayoutHistoryRepo) => {
            return NftOwnersPayoutHistoryEntity.fromRepo(nftOwnersPayoutHistoryRepo);
        });
    }

    private async fetchPayoutHistoryByTokenId(tokenId: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < NftPayoutHistoryEntity[] > {
        const nftPayoutHistoryRepos = await this.nftPayoutHistoryRepo.findAll({
            where: {
                [NftPayoutHistoryRepoColumn.TOKEN_ID]: tokenId,
            },
            transaction: dbTx,
            lock: dbLock,
        });
        return nftPayoutHistoryRepos.map((nftPayoutHistoryRepo) => {
            return NftPayoutHistoryEntity.fromRepo(nftPayoutHistoryRepo);
        });
    }

    private static checkTimeframe(timestampFrom: number, timestampTo: number) {
        if (timestampFrom > timestampTo) {
            console.error(`Invalid timeframe. TimestampFrom > TimestampTo. TimestampFrom: ${timestampFrom}, TimestampTo: ${timestampTo}`);
            throw new DataServiceError();
        }
    }
}
