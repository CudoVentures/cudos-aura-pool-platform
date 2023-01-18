import BigNumber from 'bignumber.js';

export default class PlatformTotalEarningsCudosEntity {

    resaleRoyaltiesTotalEarningsInAcudos: BigNumber;

    constructor() {
        this.resaleRoyaltiesTotalEarningsInAcudos = new BigNumber(0);
    }

    static fromJson(json: any): PlatformTotalEarningsCudosEntity {
        if (json === null) {
            return null;
        }

        const entity = new PlatformTotalEarningsCudosEntity();

        entity.resaleRoyaltiesTotalEarningsInAcudos = new BigNumber(json.resaleRoyaltiesTotalEarningsInAcudos ?? entity.resaleRoyaltiesTotalEarningsInAcudos);

        return entity;
    }

}
