import BigNumber from 'bignumber.js';

export default class MiningFarmTotalEarningsBtcEntity {

    unsoftNftsTotalEarningsInBtc: BigNumber;

    constructor() {
        this.unsoftNftsTotalEarningsInBtc = new BigNumber(0);
    }

    static fromJson(json: any): MiningFarmTotalEarningsBtcEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmTotalEarningsBtcEntity();

        entity.unsoftNftsTotalEarningsInBtc = new BigNumber(json.unsoftNftsTotalEarningsInBtc ?? entity.unsoftNftsTotalEarningsInBtc);

        return entity;
    }

}
