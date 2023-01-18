import BigNumber from 'bignumber.js';

export default class MiningFarmTotalEarningsCudosEntity {
    resaleRoyaltiesTotalEarningsInAcudos: BigNumber;
    soldNftsTotalEarningsInAcudos: BigNumber;

    constructor() {
        this.resaleRoyaltiesTotalEarningsInAcudos = null;
        this.soldNftsTotalEarningsInAcudos = null;
    }

    static toJson(entity: MiningFarmTotalEarningsCudosEntity) {
        if (entity === null) {
            return null;
        }
        return {
            'resaleRoyaltiesTotalEarningsInAcudos': entity.resaleRoyaltiesTotalEarningsInAcudos.toString(),
            'soldNftsTotalEarningsInAcudos': entity.soldNftsTotalEarningsInAcudos.toString(),
        }
    }
}
