import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import BigNumber from 'bignumber.js';
import { timeStamp } from 'console';
import { Royalty } from 'cudosjs/build/stargate/modules/marketplace/proto-types/royalty';
import sequelize, { Op } from 'sequelize';
import UserEntity from '../account/entities/user.entity';
import { CollectionService } from '../collection/collection.service';
import ChainMarketplaceCollectionEntity, { RoyaltiesReceiver, RoyaltiesType } from '../collection/entities/chain-marketplace-collection.entity';
import CollectionFilterEntity from '../collection/entities/collection-filter.entity';
import { CollectionEntity } from '../collection/entities/collection.entity';
import { DataServiceError } from '../common/errors/errors';
import { IntBoolValue } from '../common/utils';
import MiningFarmEntity from '../farm/entities/mining-farm.entity';
import { FarmService } from '../farm/farm.service';
import GeneralService from '../general/general.service';
import NftMarketplaceTradeHistoryEntity from '../graphql/entities/nft-marketplace-trade-history.entity';
import NftModuleNftTransferEntity from '../graphql/entities/nft-module-nft-transfer-history';
import { GraphqlService } from '../graphql/graphql.service';
import NftFilterEntity from '../nft/entities/nft-filter.entity';
import NftEntity from '../nft/entities/nft.entity';
import { NFTService } from '../nft/nft.service';
import EarningsPerDayFilterEntity from './entities/earnings-per-day-filter.entity';
import EarningsPerDayEntity, { EarningWithTimestampEntity } from './entities/earnings-per-day.entity';
import MegaWalletEventFilterEntity from './entities/mega-wallet-event-filter.entity';
import MegaWalletEventEntity from './entities/mega-wallet-event.entity';
import MiningFarmEarningsEntity from './entities/mining-farm-earnings.entity';
import MiningFarmMaintenanceFeeEntity from './entities/mining-farm-maintenance-fees.entity';
import NftEarningsEntity from './entities/nft-earnings.entity';
import NftEventFilterEntity from './entities/nft-event-filter.entity';
import NftEventEntity from './entities/nft-event.entity';
import { NftOwnersPayoutHistoryEntity } from './entities/nft-owners-payout-history.entity';
import { NftPayoutHistoryEntity } from './entities/nft-payout-history.entity';
import EarningsEntity from './entities/platform-earnings.entity';
import TotalEarningsEntity from './entities/platform-earnings.entity';
import UserEarningsEntity from './entities/user-earnings.entity';

import { NftOwnersPayoutHistoryRepo, NftOwnersPayoutHistoryRepoColumn } from './repos/nft-owners-payout-history.repo';
import { NftPayoutHistoryRepo, NftPayoutHistoryRepoColumn } from './repos/nft-payout-history.repo';
import { dayInMs, getDays } from './statistics.types';

export enum BtcEarningsType {
    MAINTENANCE_FEE = 'maintenanceFee',
    EARNINGS = 'earnings'
}

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
    ) {}

    async fetchNftEventsByFilter(userEntity: UserEntity, nftEventFilterEntity: NftEventFilterEntity): Promise<{ nftEventEntities: NftEventEntity[], nftEntities: NftEntity[], total: number }> {
        if (nftEventFilterEntity.isTimestampFilterSet() === true) {
            StatisticsService.checkTimeframe(nftEventFilterEntity.timestampFrom, nftEventFilterEntity.timestampTo);
        }

        const { nftEventEntities, nftEntitiesMap } = nftEventFilterEntity.isPlatformFilter() ? await this.fetchPlatformNftEvents() : await this.fetchNftEventsByNftFilter(userEntity, nftEventFilterEntity);

        nftEventEntities.sort((a, b) => ((a.timestamp > b.timestamp) ? 1 : -1))

        // filter for event type
        let filteredNftEntities = nftEventFilterEntity.isEventFilterSet()
            ? nftEventEntities.filter((entity) => nftEventFilterEntity.eventTypes.includes(entity.eventType))
            : nftEventEntities;

        // filter for period
        filteredNftEntities = nftEventFilterEntity.isTimestampFilterSet()
            ? filteredNftEntities.filter((entity) => entity.timestamp >= nftEventFilterEntity.timestampFrom && entity.timestamp <= nftEventFilterEntity.timestampTo)
            : filteredNftEntities;

        // slice
        const slicedFilteredNftEntities = filteredNftEntities.slice(nftEventFilterEntity.from, nftEventFilterEntity.from + nftEventFilterEntity.count);

        const nftEntities = slicedFilteredNftEntities.map((nftEventEntity) => nftEntitiesMap.get(nftEventEntity.nftId));

        return {
            nftEventEntities: slicedFilteredNftEntities,
            nftEntities,
            total: filteredNftEntities.length,
        }
    }

    async fetchMegaWalletEventsByFilter(megaWalletEventFilterEntity: MegaWalletEventFilterEntity): Promise<{ megaWalletEventEntities: MegaWalletEventEntity[], nftEntities: NftEntity[], total: number }> {
        if (megaWalletEventFilterEntity.isTimestampFilterSet() === true) {
            StatisticsService.checkTimeframe(megaWalletEventFilterEntity.timestampFrom, megaWalletEventFilterEntity.timestampTo);
        }

        const { nftEventEntities, nftEntitiesMap } = await this.fetchPlatformNftEvents();

        const filteredNftEntities = nftEventEntities.filter((nftEventEntity) => nftEventEntity.hasPrice() === true);

        let denomIds = filteredNftEntities.map((nftEventEntity) => nftEventEntity.denomId);
        denomIds = denomIds.filter((denomId, i) => denomIds.findIndex((value) => value === denomId) === i);

        const marketplaceCollectionEntities = await this.graphqlService.fetchMarketplaceCollectionsByDenomIds(denomIds);
        const denomIdMarketplaceCollectionEntityMap = new Map<string, ChainMarketplaceCollectionEntity>();
        marketplaceCollectionEntities.forEach((marketplaceCollectionEntity) => {
            denomIdMarketplaceCollectionEntityMap.set(marketplaceCollectionEntity.denomId, marketplaceCollectionEntity);
        })

        const collectionEntities = await this.collectionService.findByDenomIds(denomIds);
        const farmIdCollectionEntityMap = new Map<number, CollectionEntity>();
        collectionEntities.forEach((collectionEntity) => {
            farmIdCollectionEntityMap.set(collectionEntity.farmId, collectionEntity);
        })

        const farmEntities = await this.farmService.findMiningFarmByIds(collectionEntities.map((collectionEntity) => collectionEntity.farmId));
        const denomIdFarmMap = new Map<string, MiningFarmEntity>();
        farmEntities.forEach((farmEntity) => {
            const collectionEntity = farmIdCollectionEntityMap.get(farmEntity.id)
            denomIdFarmMap.set(collectionEntity.denomId, farmEntity);
        })

        let megaWalletEventEntities = filteredNftEntities.map((nftEventEntity) => {
            return MegaWalletEventEntity.fromNftEventEntity(
                nftEventEntity,
                denomIdMarketplaceCollectionEntityMap.get(nftEventEntity.denomId),
                denomIdFarmMap.get(nftEventEntity.denomId),
            )
        });

        megaWalletEventEntities.sort((a, b) => ((a.timestamp > b.timestamp) ? 1 : -1))

        // filter for event type
        megaWalletEventEntities = megaWalletEventFilterEntity.isEventFilterSet()
            ? megaWalletEventEntities.filter((entity) => megaWalletEventFilterEntity.eventTypes.includes(entity.eventType))
            : megaWalletEventEntities;

        // filter for period
        megaWalletEventEntities = megaWalletEventFilterEntity.isTimestampFilterSet()
            ? megaWalletEventEntities.filter((entity) => entity.timestamp >= megaWalletEventFilterEntity.timestampFrom && entity.timestamp <= megaWalletEventFilterEntity.timestampTo)
            : megaWalletEventEntities;

        // slice
        megaWalletEventEntities = megaWalletEventEntities.slice(megaWalletEventFilterEntity.from, megaWalletEventFilterEntity.from + megaWalletEventFilterEntity.count);

        const nftEntities = megaWalletEventEntities.map((nftEventEntity) => nftEntitiesMap.get(nftEventEntity.nftId));

        return {
            megaWalletEventEntities,
            nftEntities,
            total: nftEventEntities.length,
        }
    }

    private async fetchPlatformNftEvents(): Promise < {nftEventEntities: NftEventEntity[], nftEntitiesMap: Map<string, NftEntity>} > {
        // fetch all events from graphql
        const nftModuleNftTransferEntities = await this.graphqlService.fetchNftPlatformTransferHistory();
        const nftMarketplaceTradeEntities = await this.graphqlService.fetchMarketplacePlatformNftTradeHistory();

        // get denom and token ids for query from db
        let denomIds = nftModuleNftTransferEntities.map((entity) => entity.denomId);
        denomIds = denomIds.concat(nftMarketplaceTradeEntities.map((entity) => entity.denomId));
        denomIds = denomIds.filter((denomId, i) => denomIds.findIndex((id) => id === denomId) === i);

        let tokenIds = nftModuleNftTransferEntities.map((entity) => entity.tokenId);
        tokenIds = tokenIds.concat(nftMarketplaceTradeEntities.map((entity) => entity.tokenId));
        tokenIds = tokenIds.filter((tokenId, i) => tokenIds.findIndex((id) => id === tokenId) === i);

        // get collections so we can query nfts by collection ids
        const collections = await this.collectionService.findByDenomIds(denomIds);
        const collectionIdCollectionMap = new Map<number, CollectionEntity>();
        collections.forEach((entity) => collectionIdCollectionMap.set(entity.id, entity));

        // get nfts by collection ids and token ids
        const nfts = await this.nftService.findByCollectionIdsAndTokenIds(
            collections.map((entity) => entity.id),
            tokenIds,
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

            nftEventEntities.push(nftEventEntity);
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

    private async fetchNftEventsByNftFilter(userEntity: UserEntity, nftEventFilterEntity: NftEventFilterEntity): Promise< {nftEventEntities: NftEventEntity[], nftEntitiesMap: Map<string, NftEntity> } > {
        if (nftEventFilterEntity.isTimestampFilterSet() === true) {
            StatisticsService.checkTimeframe(nftEventFilterEntity.timestampFrom, nftEventFilterEntity.timestampTo);
        }

        const nftFilterEntity = new NftFilterEntity();
        if (nftEventFilterEntity.isBySessionAccount() === true) {
            nftFilterEntity.sessionAccount = IntBoolValue.TRUE;
        }

        if (nftEventFilterEntity.isByMiningFarmId() === true) {
            const collectionFilterEntity = new CollectionFilterEntity();
            collectionFilterEntity.farmId = nftEventFilterEntity.miningFarmId;
            const { collectionEntities } = await this.collectionService.findByFilter(collectionFilterEntity);
            nftFilterEntity.collectionIds = collectionEntities.map((collectionEntity) => collectionEntity.id.toString());
        }

        if (nftEventFilterEntity.isByNftId()) {
            nftFilterEntity.nftIds = [nftEventFilterEntity.nftId];
        }

        const { nftEntities } = await this.nftService.findByFilter(userEntity, nftFilterEntity)
        const tokenIdNftMap = new Map<string, NftEntity>();
        nftEntities.forEach((nftEntity) => {
            tokenIdNftMap.set(nftEntity.tokenId, nftEntity);
        })

        const collectionEntities = await this.collectionService.findByCollectionIds(nftEntities.map((nftEntity) => nftEntity.collectionId));
        const collectionIdCollectionMap = new Map<number, CollectionEntity>();
        collectionEntities.forEach((collectionEntity) => {
            collectionIdCollectionMap.set(collectionEntity.id, collectionEntity);
        })

        // this is a row in bdjuno that combines denom id and token id for easier search
        const uniqIds = nftEntities.map((nftEntity) => {
            const collectionEntity = collectionIdCollectionMap.get(nftEntity.collectionId);
            return `${nftEntity.tokenId}@${collectionEntity.denomId}`;
        })

        const nftmoduleNftTransferEntities = await this.graphqlService.fetchNftTransferHistoryByUniqueIds(uniqIds);
        const nftmarketplaceTradeEntities = await this.graphqlService.fetchMarketplaceNftTradeHistoryByUniqueIds(uniqIds);

        const nftEventEntities: NftEventEntity[] = [];

        nftmoduleNftTransferEntities.forEach((nftModuleNftTransferEntity: NftModuleNftTransferEntity) => {
            const nftId = tokenIdNftMap.get(nftModuleNftTransferEntity.tokenId).id;
            const nftTransferHistoryEntity = NftEventEntity.fromNftModuleTransferHistory(nftModuleNftTransferEntity);
            nftTransferHistoryEntity.nftId = nftId;

            nftEventEntities.push(nftTransferHistoryEntity);
        })

        nftmarketplaceTradeEntities.forEach((nftMarketplaceTradeHistoryEntity: NftMarketplaceTradeHistoryEntity) => {
            const nftId = tokenIdNftMap.get(nftMarketplaceTradeHistoryEntity.tokenId).id;
            const nftTransferHistoryEntity = NftEventEntity.fromNftMarketplaceTradeHistory(nftMarketplaceTradeHistoryEntity);
            nftTransferHistoryEntity.nftId = nftId;

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

    async fetchEarningsByCudosAddress(cudosAddress: string, timestampFrom: number, timestampTo: number): Promise < UserEarningsEntity > {
        StatisticsService.checkTimeframe(timestampFrom, timestampTo);

        const earningsPerDayEntity = new EarningsPerDayEntity(timestampFrom, timestampTo);
        const nftOwnersPayoutHistoryEntities = await this.fetchNftOwnersPayoutHistoryByCudosAddress(cudosAddress, timestampFrom, timestampTo);
        earningsPerDayEntity.calculateEarningsByNftOwnersPayoutHistory(nftOwnersPayoutHistoryEntities);

        const sqlRow = await this.nftOwnersPayoutHistoryRepo.findOne({
            where: {
                [NftOwnersPayoutHistoryRepoColumn.OWNER]: cudosAddress,
                [NftOwnersPayoutHistoryRepoColumn.SENT]: true,
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col(NftOwnersPayoutHistoryRepoColumn.REWARD)), 'sumOfRewards'],
            ],
        });
        const sumOfRewards = sqlRow.getDataValue('sumOfRewards');
        const totalEarningInBtc = new BigNumber(sumOfRewards ?? 0);

        const activeNftEntities = await this.nftService.findActiveByCurrentOwner(cudosAddress);
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

    async fetchEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number): Promise < NftEarningsEntity > {
        StatisticsService.checkTimeframe(timestampFrom, timestampTo);

        const earningsPerDayEntity = new EarningsPerDayEntity(timestampFrom, timestampTo);

        const nftEntity = await this.nftService.findOne(nftId);
        if (nftEntity.isMinted() === true) {
            const nftPayoutHistoryEntities = await this.fetchPayoutHistoryByTokenId(nftEntity.getTokenIdAsInt());
            const nftPayoutHistoryIds = nftPayoutHistoryEntities.map((nftPayoutHistoryEntity) => nftPayoutHistoryEntity.id);
            const nftOwnersPayoutHistoryEntities = await this.fetchNftOwnersPayoutHistoryByPayoutHistoryIds(nftPayoutHistoryIds, timestampFrom, timestampTo);
            earningsPerDayEntity.calculateEarningsByNftOwnersPayoutHistory(nftOwnersPayoutHistoryEntities);
        }

        const nftEarningsEntity = new NftEarningsEntity();
        nftEarningsEntity.earningsPerDayInBtc = earningsPerDayEntity.earningsPerDay;
        return nftEarningsEntity;
    }

    async fetchEarningsByMiningFarmId(miningFarmId: number, timestampFrom: number, timestampTo: number): Promise < MiningFarmEarningsEntity > {
        StatisticsService.checkTimeframe(timestampFrom, timestampTo);

        // fetch all nfts for farm
        const farmCollectionEntities = await this.collectionService.findByFarmId(miningFarmId);
        const denomIdCollectionEntityMap = new Map<string, CollectionEntity>();
        farmCollectionEntities.forEach((collectionEntity: CollectionEntity) => {
            denomIdCollectionEntityMap.set(collectionEntity.denomId, collectionEntity);
        })

        const farmNftEntities = await this.nftService.findByCollectionIds(farmCollectionEntities.map((collectionEntity) => collectionEntity.id));
        const farmDenomIds = farmCollectionEntities.map((collectionEntity) => collectionEntity.denomId);

        // fetch marketplace collections for the royalties data
        const farmMarketplaceCollectionEntities = await this.graphqlService.fetchMarketplaceCollectionsByDenomIds(farmDenomIds);
        const denomIdMarketplaceCollectionEntityMap = new Map<string, ChainMarketplaceCollectionEntity>();
        farmMarketplaceCollectionEntities.forEach((collectionEntity) => {
            denomIdMarketplaceCollectionEntityMap.set(collectionEntity.denomId, collectionEntity);
        })

        // calculate total number of sold nfts
        const mintedNftsCount = farmNftEntities.filter((nftEntity) => nftEntity.isMinted()).length;

        // fetch all events for those nfts
        const farmNftMarketplaceEventEntities = await this.graphqlService.fetchMarketplaceNftTradeHistoryByDenomIds(farmDenomIds);
        const farmNftEventEntities = farmNftMarketplaceEventEntities.map((nftMarketplaceTradeHistoryEventEntity) => NftEventEntity.fromNftMarketplaceTradeHistory(nftMarketplaceTradeHistoryEventEntity));

        // filter events by minted and by resale
        const farmNftMintEventEntities = farmNftEventEntities.filter((nftEventEntity: NftEventEntity) => nftEventEntity.isMintEvent() === true);
        const farmNftSaleEventEntities = farmNftEventEntities.filter((nftEventEntity: NftEventEntity) => nftEventEntity.isSaleEvent() === true);

        const timestampEarningEntities: EarningWithTimestampEntity[] = [];

        // calculate total minted farm royalties and total resale farm royalties
        const nftMintRoyaltiesSum = farmNftMintEventEntities
            .map((nftEventEntity) => {
                const marketplaceCollectionEntity = denomIdMarketplaceCollectionEntityMap.get(nftEventEntity.denomId);

                if (!marketplaceCollectionEntity) {
                    return new BigNumber(0);
                }

                const farmMintRoyaltiesPercent = marketplaceCollectionEntity.mintRoyalties.find((royalty: Royalty) => royalty.address === marketplaceCollectionEntity.farmMintRoyaltiesAddress);

                if (!farmMintRoyaltiesPercent) {
                    return new BigNumber(0);
                }

                const mintPrice = nftEventEntity.transferPriceInAcudos;
                timestampEarningEntities.push(new EarningWithTimestampEntity(nftEventEntity.timestamp, mintPrice.multipliedBy(parseInt(farmMintRoyaltiesPercent.percent) / 100)));

                return mintPrice;
            })
            .reduce((acc: BigNumber, nextValue) => acc.plus(nextValue), new BigNumber(0));

        const nftResaleRoyaltiesSum = farmNftSaleEventEntities
            .map((nftEventEntity) => {
                const marketplaceCollectionEntity = denomIdMarketplaceCollectionEntityMap.get(nftEventEntity.denomId);

                if (!marketplaceCollectionEntity) {
                    return new BigNumber(0);
                }

                const farmResaleRoyaltiesPercent = marketplaceCollectionEntity.resaleRoyalties.find((royalty: Royalty) => royalty.address === marketplaceCollectionEntity.farmResaleRoyaltiesAddress);

                if (!farmResaleRoyaltiesPercent) {
                    return new BigNumber(0);
                }

                const earningFromResale = nftEventEntity.transferPriceInAcudos.multipliedBy(parseInt(farmResaleRoyaltiesPercent.percent) / 100);
                timestampEarningEntities.push(new EarningWithTimestampEntity(nftEventEntity.timestamp, earningFromResale));

                return earningFromResale;
            })
            .reduce((acc: BigNumber, nextValue) => acc.plus(nextValue), new BigNumber(0));

        // fetch maintenance fees for farm
        const sumOfMaintenanceFeesRow = await this.nftPayoutHistoryRepo.findOne({ where: {
            [NftPayoutHistoryRepoColumn.DENOM_ID]: farmMarketplaceCollectionEntities.map((marketplaceCollectionEntity) => marketplaceCollectionEntity.denomId),
        },
        attributes: [
            [sequelize.fn('SUM', sequelize.col(NftPayoutHistoryRepoColumn.MAINTENANCE_FEE)), 'sumOfMaintenanceFees'],
        ] })

        const sumOfMaintenanceFees = sumOfMaintenanceFeesRow.getDataValue('sumOfMaintenanceFees');

        // calculate earnings per day in acudos
        const earningsPerDayEntity = new EarningsPerDayEntity(timestampFrom, timestampTo);
        earningsPerDayEntity.calculateEarningsByTimestampEarningEntities(timestampEarningEntities);

        const miningFarmEarningsEntity = new MiningFarmEarningsEntity();

        miningFarmEarningsEntity.totalMiningFarmNftSalesInAcudos = nftMintRoyaltiesSum;
        miningFarmEarningsEntity.totalMiningFarmRoyaltiesInAcudos = nftResaleRoyaltiesSum;
        miningFarmEarningsEntity.totalNftSold = mintedNftsCount;
        miningFarmEarningsEntity.maintenanceFeeDepositedInBtc = new BigNumber(sumOfMaintenanceFees ?? 0);
        miningFarmEarningsEntity.earningsPerDayInAcudos = earningsPerDayEntity.earningsPerDay;

        return miningFarmEarningsEntity;
    }

    // TODO: needs to be rewritten
    async fetchPlatformEarnings(timestampFrom: number, timestampTo: number): Promise < TotalEarningsEntity > {
        StatisticsService.checkTimeframe(timestampFrom, timestampTo);

        const days = getDays(Number(timestampFrom), Number(timestampTo))

        const payoutHistoryForPeriod = await this.nftPayoutHistoryRepo.findAll({ where: {
            payout_period_start: {
                [Op.gte]: Number(timestampFrom) / 1000,
            },
            payout_period_end: {
                [Op.lte]: Number(timestampTo) / 1000,
            },
        } })

        const earningsPerDayInUsd = days.map((day) => {
            let earningsForDay = 0

            payoutHistoryForPeriod.forEach((nftPayoutHistory) => {
                if ((nftPayoutHistory.payout_period_start * 1000) >= day && (nftPayoutHistory.payout_period_end * 1000) <= day + dayInMs) {
                    earningsForDay += Number(nftPayoutHistory.reward)
                }
            })

            return earningsForDay
        })

        // const { salesInAcudos } = await this.graphqlService.fetchTotalPlatformSales();

        const totalEarningsEntity = new TotalEarningsEntity();

        // totalEarningsEntity.acudosEarningsPerDay = new BigNumber(3)
        // totalEarningsEntity.earningsPerDayInUsd = earningsPerDayInUsd;

        return totalEarningsEntity;
    }

    async fetchEarningsPerDay(earningsPerDayFilterEntity: EarningsPerDayFilterEntity): Promise < EarningsEntity > {
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

        const { collectionEntities } = await this.collectionService.findByFilter(collectionFilterModel);
        const collectionIdEntityMap = new Map<number, CollectionEntity>();
        collectionEntities.forEach((entity) => {
            collectionIdEntityMap.set(entity.id, entity)
        })

        let acudosEarningsPerDay = [];
        if (earningsPerDayFilterEntity.shouldFetchCudosEarnings() === true) {
            acudosEarningsPerDay = await this.fetchCudosEarningsForNfts(collectionEntities, earningsPerDayFilterEntity)
        }

        let btcEarningsPerDay = [];
        if (earningsPerDayFilterEntity.shouldFetchBtcEarnings() === true) {
            btcEarningsPerDay = await this.fetchBtcEarnings(earningsPerDayFilterEntity)
        }

        const earningsEntity = new EarningsEntity();
        earningsEntity.acudosEarningsPerDay = acudosEarningsPerDay;
        earningsEntity.btcEarningsPerDay = btcEarningsPerDay;

        return earningsEntity
    }

    private async fetchCudosEarningsForNfts(collectionEntities: CollectionEntity[], earningsPerDayFilterEntity: EarningsPerDayFilterEntity): Promise< BigNumber[] > {
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
        nftMintEventEntities.map((nftEventEntity) => {
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

        nftSaleEventEntities.map((nftEventEntity) => {
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

    private async fetchBtcEarnings(earningsPerDayFilterEntity: EarningsPerDayFilterEntity): Promise < BigNumber[] > {
        let address = null;

        if (earningsPerDayFilterEntity.isEarningsReceiverFarm() === true) {
            const farm = await this.farmService.findMiningFarmById(parseInt(earningsPerDayFilterEntity.farmId));

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

        const ownersPayoutHistoryForPeriod = await this.fetchNftOwnersPayoutHistoryByPayoutAddress(address, earningsPerDayFilterEntity.timestampFrom, earningsPerDayFilterEntity.timestampTo);
        const earningsPerDayEntity = new EarningsPerDayEntity(earningsPerDayFilterEntity.timestampFrom, earningsPerDayFilterEntity.timestampTo);
        earningsPerDayEntity.calculateEarningsByNftOwnersPayoutHistory(ownersPayoutHistoryForPeriod);

        return earningsPerDayEntity.earningsPerDay;
    }

    async fetchFarmTotalBtcReceived(farmId: number, type: BtcEarningsType): Promise < BigNumber > {
        const miningFarm = await this.farmService.findMiningFarmById(farmId);

        if (!miningFarm) {
            throw Error(`Farm not found with ID: ${farmId}`);
        }

        const address = type === BtcEarningsType.MAINTENANCE_FEE
            ? miningFarm.maintenanceFeePayoutBtcAddress
            : miningFarm.leftoverRewardsBtcAddress

        const ownersPayoutHistoryEntities = await this.fetchNftOwnersPayoutHistoryByPayoutAddress(address, 0, Number.MAX_SAFE_INTEGER);

        const total = ownersPayoutHistoryEntities.reduce((acc: BigNumber, entity) => acc.plus(entity.reward), new BigNumber(0));

        return total
    }

    async fetchPlatformTotalBtcReceived(type: BtcEarningsType): Promise < BigNumber > {
        const nftPayoutEntitites = await this.fetchAllPayoutHistory();
        const totalCudosMaintenanceFees = nftPayoutEntitites.reduce((acc: BigNumber, entity) => acc.plus(entity.cudoPartOfMaintenanceFee), new BigNumber(0));

        const address = this.configService.getOrThrow('APP_CUDOS_BTC_FEE_PAYOUT_ADDRESS');
        const ownersPayoutHistoryEntities = await this.fetchNftOwnersPayoutHistoryByPayoutAddress(address, 0, Number.MAX_SAFE_INTEGER);
        const totalBtcReceived = ownersPayoutHistoryEntities.reduce((acc: BigNumber, entity) => acc.plus(entity.reward), new BigNumber(0));

        if (type === BtcEarningsType.MAINTENANCE_FEE) {
            return totalCudosMaintenanceFees;
        }

        // the general fees and maintenance fees for CUDOS are sent to the same address
        return totalBtcReceived.minus(totalCudosMaintenanceFees);
    }

    async fetchTotalCudosRoyalties(farmId: string | null): Promise< { mintRoyalties: BigNumber, resaleRoyalties: BigNumber } > {
        const isForPlatform = farmId === null;

        const collectionFilterEntity = new CollectionFilterEntity();
        if (isForPlatform === false) {
            collectionFilterEntity.farmId = farmId;
        }

        const { collectionEntities } = await this.collectionService.findByFilter(collectionFilterEntity);

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
        nftMintEventEntities.map((nftEventEntity) => {
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
        nftSaleEventEntities.map((nftEventEntity) => {
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

    private async fetchNftOwnersPayoutHistoryByCudosAddress(cudosAddress: string, timestampFrom: number, timestampTo: number): Promise < NftOwnersPayoutHistoryEntity[] > {
        const nftOwnersPayoutHistoryRepos = await this.nftOwnersPayoutHistoryRepo.findAll({
            where: {
                [NftOwnersPayoutHistoryRepoColumn.OWNER]: cudosAddress,
                [NftOwnersPayoutHistoryRepoColumn.CREATED_AT]: {
                    [Op.gte]: new Date(timestampFrom),
                    [Op.lte]: new Date(timestampTo),
                },
                [NftOwnersPayoutHistoryRepoColumn.SENT]: true,
            },
        });

        return nftOwnersPayoutHistoryRepos.map((nftOwnersPayoutHistoryRepo) => {
            return NftOwnersPayoutHistoryEntity.fromRepo(nftOwnersPayoutHistoryRepo);
        });
    }

    private async fetchNftOwnersPayoutHistoryByPayoutAddress(btcAddress: string, timestampFrom: number, timestampTo: number): Promise < NftOwnersPayoutHistoryEntity[] > {
        const nftOwnersPayoutHistoryRepos = await this.nftOwnersPayoutHistoryRepo.findAll({
            where: {
                [NftOwnersPayoutHistoryRepoColumn.PAYOUT_ADDRESS]: btcAddress,
                [NftOwnersPayoutHistoryRepoColumn.CREATED_AT]: {
                    [Op.gte]: new Date(timestampFrom),
                    [Op.lte]: new Date(timestampTo),
                },
                [NftOwnersPayoutHistoryRepoColumn.SENT]: true,
            },
        });

        return nftOwnersPayoutHistoryRepos.map((nftOwnersPayoutHistoryRepo) => {
            return NftOwnersPayoutHistoryEntity.fromRepo(nftOwnersPayoutHistoryRepo);
        });
    }

    private async fetchNftOwnersPayoutHistoryByPayoutHistoryIds(nftPayoutHistoryIds: number[], timestampFrom: number, timestampTo: number): Promise < NftOwnersPayoutHistoryEntity[] > {
        const nftOwnersPayoutHistoryRepos = await this.nftOwnersPayoutHistoryRepo.findAll({
            where: {
                [NftOwnersPayoutHistoryRepoColumn.NFT_PAYOUT_HISTORY_ID]: nftPayoutHistoryIds,
                [NftOwnersPayoutHistoryRepoColumn.CREATED_AT]: {
                    [Op.gte]: new Date(timestampFrom),
                },
                [NftOwnersPayoutHistoryRepoColumn.SENT]: true,
            },
        });
        return nftOwnersPayoutHistoryRepos.map((nftOwnersPayoutHistoryRepo) => {
            return NftOwnersPayoutHistoryEntity.fromRepo(nftOwnersPayoutHistoryRepo);
        });
    }

    private async fetchPayoutHistoryByTokenId(tokenId: number): Promise < NftPayoutHistoryEntity[] > {
        const nftPayoutHistoryRepos = await this.nftPayoutHistoryRepo.findAll({
            where: {
                [NftPayoutHistoryRepoColumn.TOKEN_ID]: tokenId,
            },
        });
        return nftPayoutHistoryRepos.map((nftPayoutHistoryRepo) => {
            return NftPayoutHistoryEntity.fromRepo(nftPayoutHistoryRepo);
        });
    }

    private async fetchAllPayoutHistory(): Promise < NftPayoutHistoryEntity[] > {
        const nftPayoutHistoryRepos = await this.nftPayoutHistoryRepo.findAll();
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
