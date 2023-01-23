import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../../common/utils';
import { FarmPaymentStatisticsRepo } from '../repos/farm-payment-statistics.repo';

export class FarmpaymentEntity {

    id: number;
    farmId: number;
    amountBtc: BigNumber;
    createdAt: number;
    updatedAt: number;

    constructor() {
        this.id = NOT_EXISTS_INT;
        this.farmId = NOT_EXISTS_INT;
        this.amountBtc = null;
        this.createdAt = NOT_EXISTS_INT;
        this.updatedAt = NOT_EXISTS_INT;
    }

    static fromRepo(repoJson: FarmPaymentStatisticsRepo): FarmpaymentEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new FarmpaymentEntity();

        entity.id = repoJson.id ?? entity.id;
        entity.farmId = repoJson.farm_id ?? entity.farmId;
        entity.amountBtc = repoJson.amount_btc ? new BigNumber(repoJson.amountBtc) : entity.reward;
        entity.createdAt = repoJson.createdAt?.getTime() ?? entity.createdAt;
        entity.updatedAt = repoJson.updatedAt?.getTime() ?? entity.updatedAt;

        return entity;
    }
}
