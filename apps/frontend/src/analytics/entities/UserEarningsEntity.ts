import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import { formatBtc } from '../../core/utilities/NumberFormatter';

export default class UserEarningsEntity {

    totalEarningInBtc: BigNumber;
    totalNftBought: number;
    totalContractHashPowerInTh: number;
    earningsPerDayInBtc: BigNumber[];
    btcEarnedInBtc: BigNumber;

    constructor() {
        this.totalEarningInBtc = new BigNumber(0);
        this.totalNftBought = 0;
        this.totalContractHashPowerInTh = 0;
        this.earningsPerDayInBtc = [];
        this.btcEarnedInBtc = new BigNumber(0);

        makeAutoObservable(this);
    }

    formatBtcEarnedInBtc(): string {
        return formatBtc(this.btcEarnedInBtc);
    }

    getEarningsPerDayInBtcAsNumber(): number[] {
        return this.earningsPerDayInBtc.map((bn) => {
            return bn.toNumber();
        });
    }

    static toJson(entity: UserEarningsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'totalEarningInBtc': entity.totalEarningInBtc.toString(10),
            'totalNftBought': entity.totalNftBought,
            'totalContractHashPowerInTh': entity.totalContractHashPowerInTh,
            'earningsPerDayInBtc': entity.earningsPerDayInBtc.map((bn) => bn.toString(10)),
            'btcEarnedInBtc': entity.btcEarnedInBtc.toString(10),
        }
    }

    static fromJson(json: any): UserEarningsEntity {
        if (json === null) {
            return null;
        }

        const entity = new UserEarningsEntity();

        entity.totalEarningInBtc = new BigNumber(json.totalEarningInBtc ?? entity.totalEarningInBtc);
        entity.totalNftBought = parseInt(json.totalNftBought ?? entity.totalNftBought);
        entity.totalContractHashPowerInTh = parseInt(json.totalContractHashPowerInTh ?? entity.totalContractHashPowerInTh);
        entity.earningsPerDayInBtc = (json.earningsPerDayInBtc ?? entity.earningsPerDayInBtc).map((j) => new BigNumber(j));
        entity.btcEarnedInBtc = new BigNumber(json.btcEarnedInBtc ?? entity.btcEarnedInBtc);

        return entity;
    }

}
