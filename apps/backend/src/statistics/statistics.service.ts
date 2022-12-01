import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CollectionService } from '../collection/collection.service';
import { GraphqlService } from '../graphql/graphql.service';
import { NFTService } from '../nft/nft.service';
import { NftStatus } from '../nft/nft.types';
import { NftEventFilterDto } from './dto/event-history-filter.dto';
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
    ) {}

    async fetchNftEventsByFilter(nftEventFilterDto: NftEventFilterDto): Promise<{ nftEventEntities: TransferHistoryEntry[], total: number }> {

        // fetch by session account
        // fetch by nft id
        // fetch by event type
        const { token_id, collection } = await this.nftService.findOne(uid)
        const { denom_id } = collection

        const nftTransferHistory = await this.graphqlService.fetchNftTransferHistory(token_id, denom_id);
        const nftTradeHistory = await this.graphqlService.fetchMarketplaceNftTradeHistory(token_id, denom_id);

        const history: TransferHistoryEntry[] = [];

        nftTransferHistory.forEach((transfer) => {
            let eventType = 'transfer';
            if (transfer.old_owner == '0x0') {
                eventType = 'mint';
            }

            history.push({
                nftId: uid,
                from: transfer.old_owner,
                to: transfer.new_owner,
                timestamp: transfer.timestamp,
                eventType,
            });
        });

        nftTradeHistory.forEach((trade) => {
            let eventType = 'sale';
            if (trade.seller = '0x0') {
                eventType = 'mint';
            }

            history.push({
                nftId: uid,
                from: trade.seller,
                to: trade.buyer,
                timestamp: trade.timestamp,
                btcPrice: trade.btc_price,
                usdPrice: trade.usd_price,
                acudosPrice: trade.price,
                eventType,
            });
        });

        history.sort((a, b) => ((a.timestamp > b.timestamp) ? 1 : -1))
    }

    async fetchNftEarnings(nftId: string, filters: { timestampFrom: string, timestampTo: string }): Promise<string[]> {
        const { token_id, collection } = await this.nftService.findOne(nftId)
        const { denom_id } = collection

        const days = getDays(Number(filters.timestampFrom), Number(filters.timestampTo))

        if (!token_id) {
            return days.map((day) => null)
        }
        const payoutHistory = await this.nftPayoutHistoryModel.findAll({ where: {
            token_id,
            denom_id,
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
        const fetchNfts = collections.map((collection) => this.nftService.findByCollectionId(collection.id))
        const nfts = (await Promise.all(fetchNfts)).flat().filter((nft) => nft.token_id !== '')

        const totalFarmSales = await this.graphqlService.fetchCollectionTotalSales(collections.map((collection) => collection.denom_id))

        const nftsWithPayoutHistoryForPeriod = await Promise.all(nfts.map(async (nft) => {
            const payoutHistoryForPeriod = await this.nftPayoutHistoryModel.findAll({ where: {
                token_id: nft.token_id,
                denom_id: nft.collection.denom_id,
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
                ...nft.toJSON(),
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
