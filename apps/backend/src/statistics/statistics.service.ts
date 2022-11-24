import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CollectionService } from '../collection/collection.service';
import { GraphqlService } from '../graphql/graphql.service';
import { NFTService } from '../nft/nft.service';
import { NftStatus } from '../nft/nft.types';
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

    async fetchNftEarnings(nftId: string, filters: { timestampFrom: string, timestampTo: string }): Promise<string[]> {
        const { token_id, collection } = await this.nftService.findOne(nftId)
        const { denom_id } = collection

        if (!token_id) {
            throw new HttpException('NFT not minted yet', 400)
        }

        const days = getDays(Number(filters.timestampFrom), Number(filters.timestampTo))

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

        return {
            totalEarningInBtc,
            totalNftBought: 0,
            earningsPerDayInUsd: rewardsPerDay,
            btcEarnedInBtc: 0,
        }
    }

    async fetchFarmEarnings(farmId: number, filters: { timestampFrom: string, timestampTo: string }): Promise<any> {
        const days = getDays(Number(filters.timestampFrom), Number(filters.timestampTo))

        const collections = await this.collectionService.findByFarmId(farmId)
        const fetchNfts = collections.map((collection) => this.nftService.findByCollectionId(collection.id))
        const nfts = (await Promise.all(fetchNfts)).flat().filter((nft) => nft.status === NftStatus.MINTED || nft.status === NftStatus.EXPIRED)

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
