import BigNumber from 'bignumber.js';

export default class MiningFarmTotalEarningsBtcEntity {
    unsoldNftsTotalEarningsInBtc: BigNumber;

    constructor() {
        this.unsoldNftsTotalEarningsInBtc = null;
    }

    static toJson(entity: MiningFarmTotalEarningsBtcEntity) {
        if (entity === null) {
            return null;
        }
        return {
            'unsoldNftsTotalEarningsInBtc': entity.unsoldNftsTotalEarningsInBtc.toString(),
        }
    }
}
