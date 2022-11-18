import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { NFTService } from '../nft/nft.service';
import { NftOwnersPayoutHistory } from './models/nft-owners-payout-history.model';
import { NftPayoutHistory } from './models/nft-payout-history.model';
import { dayInMs, getDays } from './utils';

@Injectable()
export class StatisticsService {
    constructor(
        private nftService: NFTService,
        @InjectModel(NftPayoutHistory)
        private nftPayoutHistoryModel: typeof NftPayoutHistory,
        @InjectModel(NftOwnersPayoutHistory)
        private nftOwnersPayoutHistory: typeof NftOwnersPayoutHistory,
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
                    [Op.lt]: Number(filters.timestampTo + dayInMs) / 1000,
                    [Op.eq]: Number(filters.timestampTo + dayInMs) / 1000,
                },
            },
        } })

        const rewardsPerDay = days.map(((day) => payoutHistory.find((row) => (row.payout_period_start * 1000) >= day && (row.payout_period_end * 1000) <= day + dayInMs)?.reward.toString() || null))

        return rewardsPerDay
    }

    async fetchAddressEarnings(cudosAddress: string, filters: { timestampFrom: string, timestampTo: string }): Promise<any> {
        const days = getDays(Number(filters.timestampFrom), Number(filters.timestampTo))

        const ownerPayoutHistory = await this.nftPayoutHistoryModel.findAll({
            include: [{ model: NftOwnersPayoutHistory,
                where: {
                    owner: cudosAddress,
                },
            }],
            where: {
                payout_period_start: {
                    [Op.or]: {
                        [Op.gt]: Number(filters.timestampFrom) / 1000,
                        [Op.eq]: Number(filters.timestampFrom) / 1000,
                    },
                },
                payout_period_end: {
                    [Op.or]: {
                        [Op.lt]: Number(filters.timestampTo + dayInMs) / 1000,
                        [Op.eq]: Number(filters.timestampTo + dayInMs) / 1000,
                    },
                },
            },
        })

        const rewardsPerDay = days.map(((day) => ownerPayoutHistory.find((row) => (row.payout_period_start * 1000) >= day && (row.payout_period_end * 1000) <= day + dayInMs)?.reward.toString() || null))

        return {
            totalEarningInBtc: 0,
            totalNftBought: 0,
            earningsPerDayInUsd: rewardsPerDay,
            btcEarnedInBtc: 0,
        }
    }
}
