import BigNumber from 'bignumber.js';

export default class UserEarningsEntity {

    totalEarningInBtc: BigNumber;
    totalNftBought: number;
    totalContractHashPowerInTh: number;
    earningsPerDayInUsd: number[];
    btcEarnedInBtc: BigNumber;

    constructor() {
        this.totalEarningInBtc = new BigNumber(0);
        this.totalNftBought = 0;
        this.totalContractHashPowerInTh = 0;
        this.earningsPerDayInUsd = [];
        this.btcEarnedInBtc = new BigNumber(0);
    }

    static toJson(entity: UserEarningsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'totalEarningInBtc': entity.totalEarningInBtc.toString(),
            'totalNftBought': entity.totalNftBought,
            'totalContractHashPowerInTh': entity.totalContractHashPowerInTh,
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
        entity.earningsPerDayInUsd = (json.earningsPerDayInUsd ?? entity.earningsPerDayInUsd).map((j) => parseInt(j));
        entity.btcEarnedInBtc = new BigNumber(json.btcEarnedInBtc ?? entity.btcEarnedInBtc);

        return entity;
    }

}
