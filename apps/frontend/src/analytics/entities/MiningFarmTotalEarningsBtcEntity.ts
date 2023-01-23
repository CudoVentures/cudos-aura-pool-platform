import BigNumber from 'bignumber.js';

export default class MiningFarmTotalEarningsBtcEntity {

    unsoldNftsTotalEarningsInBtc: BigNumber;

    constructor() {
        this.unsoldNftsTotalEarningsInBtc = new BigNumber(0);
    }

    static fromJson(json: any): MiningFarmTotalEarningsBtcEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmTotalEarningsBtcEntity();

        entity.unsoldNftsTotalEarningsInBtc = new BigNumber(json.unsoldNftsTotalEarningsInBtc ?? entity.unsoldNftsTotalEarningsInBtc);

        return entity;
    }

}
