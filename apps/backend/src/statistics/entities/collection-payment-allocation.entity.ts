import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../../common/utils';
import { CollectionPaymentAllocationRepo } from '../repos/collection-payment-allocation.repo';

export class CollectionPaymentAllocationEntity {

    id: number;
    farmId: number;
    farmPaymentId: number;
    collectionId: number;
    collectionAllocationAmountBtc: BigNumber;
    cudoGeneralFeeBtc: BigNumber;
    cudoMaintenanceFeeBtc: BigNumber;
    farmUnsoldLeftoverFeeBtc: BigNumber;
    farmMaintenanceFeeBtc: BigNumber;
    createdAt: number;
    updatedAt: number;

    constructor() {
        this.id = NOT_EXISTS_INT;
        this.farmId = NOT_EXISTS_INT;
        this.collectionId = NOT_EXISTS_INT;
        this.collectionAllocationAmountBtc = null;
        this.cudoGeneralFeeBtc = null;
        this.cudoMaintenanceFeeBtc = null;
        this.farmUnsoldLeftoverFeeBtc = null;
        this.farmMaintenanceFeeBtc = null;
        this.createdAt = NOT_EXISTS_INT;
        this.updatedAt = NOT_EXISTS_INT;
    }

    static fromRepo(repoJson: CollectionPaymentAllocationRepo): CollectionPaymentAllocationEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new CollectionPaymentAllocationEntity();

        entity.id = repoJson.id ?? entity.id;
        entity.farmId = repoJson.farm_id ?? entity.farmId;
        entity.farmPaymentId = repoJson.farm_payment_id ?? entity.farmPaymentId;
        entity.collectionId = repoJson.collection_id ?? entity.collectionId;
        entity.collectionAllocationAmountBtc = repoJson.collection_allocation_amount_btc ? new BigNumber(repoJson.collection_allocation_amount_btc) : entity.collectionAllocationAmountBtc;
        entity.cudoGeneralFeeBtc = repoJson.collection_allocation_amount_btc ? new BigNumber(repoJson.collection_allocation_amount_btc) : entity.cudoGeneralFeeBtc;
        entity.cudoMaintenanceFeeBtc = repoJson.cudo_maintenance_fee_btc ? new BigNumber(repoJson.cudo_maintenance_fee_btc) : entity.cudoMaintenanceFeeBtc;
        entity.farmUnsoldLeftoverFeeBtc = repoJson.farm_unsold_leftover_btc ? new BigNumber(repoJson.farm_unsold_leftover_btc) : entity.farmUnsoldLeftoverFeeBtc;
        entity.farmMaintenanceFeeBtc = repoJson.farm_maintenance_fee_btc ? new BigNumber(repoJson.farm_maintenance_fee_btc) : entity.farmMaintenanceFeeBtc;
        entity.createdAt = repoJson.createdAt?.getTime() ?? entity.createdAt;
        entity.updatedAt = repoJson.updatedAt?.getTime() ?? entity.updatedAt;

        return entity;
    }
}
