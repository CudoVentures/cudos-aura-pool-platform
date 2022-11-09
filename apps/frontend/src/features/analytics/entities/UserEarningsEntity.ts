import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

export default class UserEarningsEntity {

    totalEarningInBtc: BigNumber;
    totalNftBought: number;
    totalContractHashPowerInTh: number;
    totalContractHashPowerInUsd: number;
    earningsPerDayInUsd: number[];
    btcEarnedInBtc: BigNumber;

    constructor() {
        this.totalEarningInBtc = new BigNumber(0);
        this.totalNftBought = 0;
        this.totalContractHashPowerInTh = 0;
        this.totalContractHashPowerInUsd = 0;
        this.earningsPerDayInUsd = [];
        this.btcEarnedInBtc = new BigNumber(0);

        makeAutoObservable(this);
    }

    formatBtcEarnedInBtc(): string {
        return this.btcEarnedInBtc.toString();
    }

    formatTotalContractHashPowerInUsd(): string {
        return numeral(this.totalContractHashPowerInUsd).format(ProjectUtils.NUMERAL_USD);
    }

    static toJson(entity: UserEarningsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'totalEarningInBtc': entity.totalEarningInBtc.toString(),
            'totalNftBought': entity.totalNftBought,
            'totalContractHashPowerInTh': entity.totalContractHashPowerInTh,
            'totalContractHashPowerInUsd': entity.totalContractHashPowerInUsd,
            'earningsPerDayInUsd': entity.earningsPerDayInUsd,
            'btcEarnedInBtc': entity.btcEarnedInBtc.toString(),
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
        entity.totalContractHashPowerInUsd = parseInt(json.totalContractHashPowerInUsd ?? entity.totalContractHashPowerInUsd);
        entity.earningsPerDayInUsd = (json.earningsPerDayInUsd ?? entity.earningsPerDayInUsd).map((j) => parseInt(j));
        entity.btcEarnedInBtc = new BigNumber(json.btcEarnedInBtc ?? entity.btcEarnedInBtc);

        return entity;
    }

}
