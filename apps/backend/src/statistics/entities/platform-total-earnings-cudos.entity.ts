import BigNumber from 'bignumber.js';

export default class PlatformTotalEarningsCudosEntity {
    resaleRoyaltiesTotalEarningsInAcudos: BigNumber;
    soldNftsTotalEarningsInAcudos: BigNumber;

    constructor() {
        this.resaleRoyaltiesTotalEarningsInAcudos = null;
        this.soldNftsTotalEarningsInAcudos = null;
    }

    static toJson(entity: PlatformTotalEarningsCudosEntity) {
        if (entity === null) {
            return null;
        }
        return {
            'resaleRoyaltiesTotalEarningsInAcudos': entity.resaleRoyaltiesTotalEarningsInAcudos.toString(10),
            'soldNftsTotalEarningsInAcudos': entity.soldNftsTotalEarningsInAcudos.toString(10),
        }
    }
}
