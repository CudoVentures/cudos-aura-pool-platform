import BigNumber from 'bignumber.js';

export default class MiningFarmTotalEarningsCudosEntity {

    resaleRoyaltiesTotalEarningsInAcudos: BigNumber;
    soldNftsTotalEarningsInAcudos: BigNumber;

    constructor() {
        this.resaleRoyaltiesTotalEarningsInAcudos = new BigNumber(0);
        this.soldNftsTotalEarningsInAcudos = new BigNumber(0);
    }

    static fromJson(json: any): MiningFarmTotalEarningsCudosEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmTotalEarningsCudosEntity();

        entity.resaleRoyaltiesTotalEarningsInAcudos = new BigNumber(json.resaleRoyaltiesTotalEarningsInAcudos ?? entity.resaleRoyaltiesTotalEarningsInAcudos);
        entity.soldNftsTotalEarningsInAcudos = new BigNumber(json.soldNftsTotalEarningsInAcudos ?? entity.soldNftsTotalEarningsInAcudos);

        return entity;
    }

}
