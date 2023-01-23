import { NOT_EXISTS_INT } from '../../common/utils';

export enum BtcEarningsType {
    MAINTENANCE_FEE = 'maintenanceFee',
    EARNINGS = 'earnings'
}

export default class CollectionPaymentAllocationStatisticsFilter {
    farmId: number;
    collectionId: number;
    type: BtcEarningsType;
    timestampFrom: number;
    timestampTo: number;

    constructor() {
        this.farmId = NOT_EXISTS_INT;
        this.collectionId = NOT_EXISTS_INT;
        this.type = BtcEarningsType.EARNINGS;
        this.timestampFrom = NOT_EXISTS_INT;
        this.timestampTo = NOT_EXISTS_INT;
    }

    isFarmIdSet(): boolean {
        return this.farmId !== NOT_EXISTS_INT;
    }

    isCollectionIdSet(): boolean {
        return this.collectionId !== NOT_EXISTS_INT;
    }

    isTypeEarnings(): boolean {
        return this.type === BtcEarningsType.EARNINGS;
    }

    isTypeMaintenanceFee(): boolean {
        return this.type === BtcEarningsType.MAINTENANCE_FEE;
    }

    isForPlatform(): boolean {
        return this.isFarmIdSet() === false && this.isCollectionIdSet() === false;
    }

    isTimestampSet(): boolean {
        return this.timestampFrom !== NOT_EXISTS_INT && this.timestampTo !== NOT_EXISTS_INT;
    }
}
