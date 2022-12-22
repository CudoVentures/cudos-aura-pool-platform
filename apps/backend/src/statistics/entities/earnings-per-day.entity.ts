import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../../common/utils';
import { NftOwnersPayoutHistoryEntity } from './nft-owners-payout-history.entity';

export default class EarningsPerDayEntity {

    days: number[];
    earningsPerDayInBtc: BigNumber[];

    constructor(timestampFrom: number, timestampTo: number) {
        const pointer = new Date(timestampFrom);
        const days = [];

        while (pointer.getTime() < timestampTo) {
            days.push(pointer.getTime());
            pointer.setDate(pointer.getDate() + 1);
        }

        this.days = days;
        this.earningsPerDayInBtc = this.days.map(() => new BigNumber(0));
    }

    calculateEarningsByNftOwnersPayoutHistory(nftOwnersPayoutHistoryEntities: NftOwnersPayoutHistoryEntity[]) {
        nftOwnersPayoutHistoryEntities.forEach((nftOwnersPayoutHistoryEntity) => {
            const dayIndex = EarningsPerDayEntity.findIndexInDays(this.days, nftOwnersPayoutHistoryEntity.createdAt);
            if (dayIndex !== NOT_EXISTS_INT) {
                this.earningsPerDayInBtc[dayIndex].plus(nftOwnersPayoutHistoryEntity.reward);
            }
        });
    }

    sumEarnings(): BigNumber {
        return this.earningsPerDayInBtc.reduce((acc, reward) => {
            return acc.plus(reward);
        }, new BigNumber(0));
    }

    static findIndexInDays(days: number[], timestamp: number) {
        if (days.length === 0) {
            return NOT_EXISTS_INT;
        }

        // insert element at the end
        const date = new Date(days[days.length - 1]);
        date.setDate(date.getDate() + 1);
        days.push(date.getTime());

        let l = 0, r = days.length - 1;
        let result = NOT_EXISTS_INT;

        while (l <= r) {
            const m = (l + r) >> 1;

            const to = m + 1 < days.length ? days[m + 1] : Number.MAX_SAFE_INTEGER;
            if (days[m] <= timestamp && timestamp < to) {
                result = m;
                break;
            }

            if (timestamp < days[m]) {
                r = m - 1;
            } else {
                l = m + 1;
            }
        }

        return result === days.length - 1 ? NOT_EXISTS_INT : result;
    }

}