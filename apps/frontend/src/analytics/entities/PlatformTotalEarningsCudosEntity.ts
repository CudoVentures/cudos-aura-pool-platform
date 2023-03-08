import BigNumber from 'bignumber.js';

export default class PlatformTotalEarningsCudosEntity {

    resaleRoyaltiesTotalEarningsInAcudos: BigNumber;
    soldNftsTotalEarningsInAcudos: BigNumber;

    constructor() {
        this.resaleRoyaltiesTotalEarningsInAcudos = new BigNumber(0);
        this.soldNftsTotalEarningsInAcudos = new BigNumber(0);
    }

    totalEarningsInAcudos(): BigNumber {
        return this.resaleRoyaltiesTotalEarningsInAcudos.plus(this.soldNftsTotalEarningsInAcudos);
    }

    static fromJson(json: any): PlatformTotalEarningsCudosEntity {
        if (json === null) {
            return null;
        }

        const entity = new PlatformTotalEarningsCudosEntity();

        entity.resaleRoyaltiesTotalEarningsInAcudos = new BigNumber(json.resaleRoyaltiesTotalEarningsInAcudos ?? entity.resaleRoyaltiesTotalEarningsInAcudos);
        entity.soldNftsTotalEarningsInAcudos = new BigNumber(json.soldNftsTotalEarningsInAcudos ?? entity.soldNftsTotalEarningsInAcudos);

        return entity;
    }

}
