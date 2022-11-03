import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';

export default class UserEarningsEntity {

    totalBtcEarningInUsd: number;
    totalNftBounght: number;
    totalContractHashPower: number;
    totalContractHashPowerInUsd: number;
    earningsPerDayInUsd: number[];
    btcEarnedInBtc: BigNumber;
    btcEarnedInUsd: number;

    constructor() {
        this.totalBtcEarningInUsd = 0;
        this.totalNftBounght = 0;
        this.totalContractHashPower = 0;
        this.totalContractHashPowerInUsd = 0;
        this.earningsPerDayInUsd = [];
        this.btcEarnedInBtc = new BigNumber(0);
        this.btcEarnedInUsd = 0;

        makeAutoObservable(this);
    }

    formatTotalBtcEarningInUsd(): string {
        return `${numeral(this.totalBtcEarningInUsd / 1000).format('$0,0.0')}k`;
    }

    formatBtcEarnedInBtc(): string {
        return this.btcEarnedInBtc.toString();
    }

    formatBtcEarnedInUsd(): string {
        return numeral(this.btcEarnedInUsd).format('$0,0.0');
    }

    formatTotalContractHashPowerInUsd(): string {
        return numeral(this.totalContractHashPowerInUsd).format('$0,0.0');
    }

    static toJson(entity: UserEarningsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'totalBtcEarningInUsd': entity.totalBtcEarningInUsd,
            'totalNftBounght': entity.totalNftBounght,
            'totalContractHashPower': entity.totalContractHashPower,
            'totalContractHashPowerInUsd': entity.totalContractHashPowerInUsd,
            'earningsPerDayInUsd': entity.earningsPerDayInUsd,
            'btcEarnedInBtc': entity.btcEarnedInBtc.toString(),
            'btcEarnedInUsd': entity.btcEarnedInUsd,
        }
    }

    static fromJson(json: any): UserEarningsEntity {
        if (json === null) {
            return null;
        }

        const entity = new UserEarningsEntity();

        entity.totalBtcEarningInUsd = parseInt(json.totalBtcEarningInUsd ?? entity.totalBtcEarningInUsd);
        entity.totalNftBounght = parseInt(json.totalNftBounght ?? entity.totalNftBounght);
        entity.totalContractHashPower = parseInt(json.totalContractHashPower ?? entity.totalContractHashPower);
        entity.totalContractHashPowerInUsd = parseInt(json.totalContractHashPowerInUsd ?? entity.totalContractHashPowerInUsd);
        entity.earningsPerDayInUsd = (json.earningsPerDayInUsd ?? entity.earningsPerDayInUsd).map((j) => parseInt(j));
        entity.btcEarnedInBtc = new BigNumber(json.btcEarnedInBtc ?? entity.btcEarnedInBtc);
        entity.btcEarnedInUsd = parseInt(json.btcEarnedInUsd ?? entity.btcEarnedInUsd);

        return entity;
    }

}
