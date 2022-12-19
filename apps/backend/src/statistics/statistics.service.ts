import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import UserEntity from '../account/entities/user.entity';
import { CollectionService } from '../collection/collection.service';
import CollectionFilterEntity from '../collection/entities/collection-filter.entity';
import { IntBoolValue } from '../common/utils';
import NftMarketplaceTradeHistoryEntity from '../graphql/entities/nft-marketplace-trade-history.entity';
import NftModuleNftTransferHistoryEntity from '../graphql/entities/nft-module-nft-transfer-history';
import { GraphqlService } from '../graphql/graphql.service';
import NftFilterEntity from '../nft/entities/nft-filter.entity';
import NftEntity from '../nft/entities/nft.entity';
import { NFTService } from '../nft/nft.service';
import NftEventFilterEntity from './entities/nft-event-filter.entity';
import { NftTransferHistoryEntity, TransferHistoryEntity } from './entities/nft-transfer-history.entity';
import { NftOwnersPayoutHistory } from './models/nft-owners-payout-history.model';
import { NftPayoutHistory } from './models/nft-payout-history.model';
import { dayInMs, getDays } from './utils';

@Injectable()
export class StatisticsService {
    constructor(
        private nftService: NFTService,
        private collectionService: CollectionService,
        private graphqlService: GraphqlService,
        @InjectModel(NftPayoutHistory)
        private nftPayoutHistoryModel: typeof NftPayoutHistory,
        @InjectModel(NftOwnersPayoutHistory)
        private nftOwnersPayoutHistoryModel: typeof NftOwnersPayoutHistory,
    // eslint-disable-next-line no-empty-function
    ) {}

    async fetchNftEventsByFilter(userEntity: UserEntity, nftEventFilterEntity: NftEventFilterEntity): Promise<{ nftTransferHistoryEntities: NftTransferHistoryEntity[], total: number }> {
        const nftFilterEntity = new NftFilterEntity();

        if (nftEventFilterEntity.isBySessionAccount() === true) {
            nftFilterEntity.sessionAccount = IntBoolValue.TRUE;
        }

        if (nftEventFilterEntity.isByNftId()) {
            nftFilterEntity.nftIds = [nftEventFilterEntity.nftId];
        }
        // TODO fetch by event type
        // TODO: period filter

        const { nftEntities } = await this.nftService.findByFilter(userEntity, nftFilterEntity)

        const collectionFilter = new CollectionFilterEntity();
        collectionFilter.collectionIds = nftEntities.map((nftEntity) => nftEntity.collectionId.toString());
        const { collectionEntities } = await this.collectionService.findByFilter(collectionFilter);

        const transferHistoryEntities: NftTransferHistoryEntity[] = [];

        // TODO: make better after new column uniw_id is implemented in bdjuno
        for (let i = 0; i < collectionEntities.length; i++) {
            const collectionEntity = collectionEntities[i];
            const denomId = collectionEntity.denomId;
            const nftEntitiesForCollection = nftEntities.filter((nftEntity) => nftEntity.collectionId === collectionEntity.id);

            const nftTokenIdNftMap = new Map<string, NftEntity>();
            nftEntitiesForCollection.forEach((nftEntity) => nftTokenIdNftMap.set(nftEntity.tokenId, nftEntity));

            if (nftEntitiesForCollection.length === 0) {
                throw Error('Some problem with relations collectionId and nft');
            }

            const tokenIds = nftEntitiesForCollection.map((nftEntity) => nftEntity.id);

            const nftmoduleNftTransferEntities = await this.graphqlService.fetchNftTransferHistory(denomId, tokenIds);
            const nftmarketplaceTradeEntities = await this.graphqlService.fetchMarketplaceNftTradeHistory(denomId, tokenIds);

            nftmoduleNftTransferEntities.forEach((nftModuleNftTransferEntity: NftModuleNftTransferHistoryEntity) => {
                const nftId = nftTokenIdNftMap.get(nftModuleNftTransferEntity.tokenId).id;
                const nftTransferHistoryEntity = NftTransferHistoryEntity.fromNftModuleTransferHistory(nftModuleNftTransferEntity);
                nftTransferHistoryEntity.nftId = nftId;

                transferHistoryEntities.push(nftTransferHistoryEntity);
            })

            nftmarketplaceTradeEntities.forEach((nftMarketplaceTradeHistoryEntity: NftMarketplaceTradeHistoryEntity) => {
                const nftId = nftTokenIdNftMap.get(nftMarketplaceTradeHistoryEntity.tokenId).id;
                const nftTransferHistoryEntity = NftTransferHistoryEntity.fromNftMarketplaceTradeHistory(nftMarketplaceTradeHistoryEntity);
                nftTransferHistoryEntity.nftId = nftId;

                transferHistoryEntities.push(nftTransferHistoryEntity);
            })
        }

        transferHistoryEntities.sort((a, b) => ((a.timestamp > b.timestamp) ? 1 : -1))

        // filter for period
        const filteredTransferHistoryEntities = nftEventFilterEntity.isTimestampFilterSet()
            ? transferHistoryEntities.filter((entity) => entity.timestamp >= nftEventFilterEntity.timestampFrom && entity.timestamp <= nftEventFilterEntity.timestampTo)
            : transferHistoryEntities;

        return {
            nftTransferHistoryEntities: filteredTransferHistoryEntities.slice(nftEventFilterEntity.from, nftEventFilterEntity.from + nftEventFilterEntity.count),
            total: transferHistoryEntities.length,
        }
    }

    async fetchNftEarnings(nftId: string, filters: { timestampFrom: string, timestampTo: string }): Promise<string[]> {
        const nftEntity = await this.nftService.findOne(nftId)
        const collectionEntity = await this.collectionService.findOne(nftEntity.collectionId);
        const tokenId = nftEntity.tokenId;
        const denomId = collectionEntity.denomId;

        const days = getDays(Number(filters.timestampFrom), Number(filters.timestampTo))

        if (!tokenId) {
            return days.map((day) => null)
        }
        const payoutHistory = await this.nftPayoutHistoryModel.findAll({ where: {
            token_id: tokenId,
            denom_id: denomId,
            payout_period_start: {
                [Op.gte]: Number(filters.timestampFrom) / 1000,

            },
            payout_period_end: {
                [Op.lte]: Number(filters.timestampTo) / 1000,
            },
        } })

        const rewardsPerDay = days.map(((day) => payoutHistory.find((row) => (row.payout_period_start * 1000) >= day && (row.payout_period_end * 1000) <= day + dayInMs)?.reward.toString() || null))

        return rewardsPerDay
    }

    async fetchAddressEarnings(cudosAddress: string, filters: { timestampFrom: string, timestampTo: string }): Promise<any> {
        const days = getDays(Number(filters.timestampFrom), Number(filters.timestampTo))

        const ownerPayoutHistoryForPeriod = await this.nftOwnersPayoutHistoryModel.findAll({
            where: {
                owner: cudosAddress,
            },
            include: [{ model: NftPayoutHistory,
                where: {
                    payout_period_start: {
                        [Op.gte]: Number(filters.timestampFrom) / 1000,
                    },
                    payout_period_end: {
                        [Op.lte]: Number(filters.timestampTo) / 1000,
                    },
                },
            }],
        })
        const rewardsPerDay = days.map((day) => ownerPayoutHistoryForPeriod.filter((row) => (row.nft_payout_history.payout_period_start * 1000) >= day && (row.nft_payout_history.payout_period_end * 1000) <= day + dayInMs).reduce((prevVal, currVal) => prevVal + Number(currVal.reward), 0))

        const ownerPayoutHistory = await this.nftOwnersPayoutHistoryModel.findAll({
            where: {
                owner: cudosAddress,
            },
        })
        const totalEarningInBtc = ownerPayoutHistory.reduce((prevVal, currVal) => prevVal + Number(currVal.reward), 0)

        const totalNftsOwned = await this.graphqlService.fetchTotalNftsByAddress(cudosAddress)

        return {
            totalEarningInBtc,
            totalNftBought: totalNftsOwned,
            earningsPerDayInUsd: rewardsPerDay,
            btcEarnedInBtc: 0,
        }
    }

    async fetchFarmEarnings(farmId: number, filters: { timestampFrom: string, timestampTo: string }): Promise<any> {
        const days = getDays(Number(filters.timestampFrom), Number(filters.timestampTo))

        const collections = await this.collectionService.findByFarmId(farmId)
        const tempNftFilterEntity = new NftFilterEntity();
        tempNftFilterEntity.collectionIds = collections.map((collection) => collection.id.toString())
        const { nftEntities } = await this.nftService.findByFilter(null, tempNftFilterEntity);

        const nfts = (await Promise.all(nftEntities)).flat().filter((nft) => nft.tokenId !== '')

        const totalFarmSales = await this.graphqlService.fetchCollectionTotalSales(collections.map((collection) => collection.denomId))

        const nftsWithPayoutHistoryForPeriod = await Promise.all(nfts.map(async (nft) => {
            const payoutHistoryForPeriod = await this.nftPayoutHistoryModel.findAll({ where: {
                tokenId: nft.tokenId,
                denomId: collections.find((collection) => collection.id === nft.collectionId).denomId,
                payout_period_start: {
                    [Op.gte]: Number(filters.timestampFrom) / 1000,
                },
                payout_period_end: {
                    [Op.lte]: Number(filters.timestampTo) / 1000,
                },
            } })

            const nftMaintenanceFeeForPeriod = payoutHistoryForPeriod.reduce((prevValue, currValue) => prevValue + currValue.maintenance_fee, 0)
            return {
                ...NftEntity.toJson(nft),
                nftMaintenanceFeeForPeriod,
                payoutHistoryForPeriod,
            }
        }))

        const maintenanceFeeDepositedInBtc = nftsWithPayoutHistoryForPeriod.reduce((prevValue, currValue) => prevValue + currValue.nftMaintenanceFeeForPeriod, 0)

        const earningsPerDayInUsd = days.map((day) => {
            let earningsForDay = 0

            nftsWithPayoutHistoryForPeriod.map((nft) => nft.payoutHistoryForPeriod.forEach((nftPayoutHistory) => {
                if ((nftPayoutHistory.payout_period_start * 1000) >= day && (nftPayoutHistory.payout_period_end * 1000) <= day + dayInMs) {
                    earningsForDay += Number(nftPayoutHistory.reward)
                }
            }))

            return earningsForDay
        })

        return {
            totalMiningFarmSalesInAcudos: totalFarmSales.salesInAcudos || 0,
            totalNftSold: nfts.length,
            totalMiningFarmSalesInUsd: totalFarmSales.salesInUsd || 0,
            maintenanceFeeDepositedInBtc,
            earningsPerDayInUsd,
        }
    }
}
