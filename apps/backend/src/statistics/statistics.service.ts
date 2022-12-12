import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CollectionService } from '../collection/collection.service';
import { GraphqlService } from '../graphql/graphql.service';
import NftFilterEntity from '../nft/entities/nft-filter.entity';
import NftEntity from '../nft/entities/nft.entity';
import { NFTService } from '../nft/nft.service';
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

    // async fetchNftEventsByFilter(nftEventFilterDto: NftEventFilterDto): Promise<{ nftEventEntities: TransferHistoryEntry[], total: number }> {

    //     // fetch by session account
    //     // fetch by nft id
    //     // fetch by event type
    //     const nftEntity = await this.nftService.findOne(nftEventFilterDto.nftId)
    //     const collectionEntity = await this.collectionService.findOne(nftEntity.collectionId);
    //     const tokenId = nftEntity.tokenId;
    //     const denomId = collectionEntity.denomId;

    //     const nftTransferHistory = await this.graphqlService.fetchNftTransferHistory(tokenId, denomId);
    //     const nftTradeHistory = await this.graphqlService.fetchMarketplaceNftTradeHistory(tokenId, denomId);

    //     const history: TransferHistoryEntry[] = [];

    //     nftTransferHistory.forEach((transfer) => {
    //         let eventType = 'transfer';
    //         if (transfer.old_owner == '0x0') {
    //             eventType = 'mint';
    //         }

    //         history.push({
    //             nftId: uid,
    //             from: transfer.old_owner,
    //             to: transfer.new_owner,
    //             hashing_power,
    //             timestamp: transfer.timestamp,
    //             eventType,
    //         });
    //     });

    //     nftTradeHistory.forEach((trade) => {
    //         let eventType = 'sale';
    //         if (trade.seller = '0x0') {
    //             eventType = 'mint';
    //         }

    //         history.push({
    //             nftId: uid,
    //             from: trade.seller,
    //             to: trade.buyer,
    //             timestamp: trade.timestamp,
    //             btcPrice: trade.btc_price,
    //             usdPrice: trade.usd_price,
    //             acudosPrice: trade.price,
    //             eventType,
    //         });
    //     });

    //     history.sort((a, b) => ((a.timestamp > b.timestamp) ? 1 : -1))
    // }

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
                    [Op.or]: {
                        [Op.gt]: Number(filters.timestampFrom) / 1000,
                        [Op.eq]: Number(filters.timestampFrom) / 1000,
                    },
                },
                payout_period_end: {
                    [Op.or]: {
                        [Op.lt]: Number(filters.timestampTo) / 1000,
                        [Op.eq]: Number(filters.timestampTo) / 1000,
                    },
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
