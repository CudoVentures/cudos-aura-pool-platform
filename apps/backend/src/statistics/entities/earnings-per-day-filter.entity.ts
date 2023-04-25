import { NOT_EXISTS_INT, NOT_EXISTS_STRING } from '../../common/utils'
import { EarningsPerDayFilterJsonValidator } from '../statistics.types'

export enum EarningsPerDayCurrency {
    CUDOS = 'cudos',
    BTC = 'btc',
    USD = 'usd'
}

export default class EarningsPerDayFilterEntity {
    timestampFrom: number
    timestampTo: number
    currency: EarningsPerDayCurrency
    farmId: string
    collectionIds: string[]

    constructor() {
        this.timestampFrom = NOT_EXISTS_INT;
        this.timestampTo = NOT_EXISTS_INT;
        this.currency = EarningsPerDayCurrency.USD;
        this.farmId = NOT_EXISTS_STRING;
        this.collectionIds = null;
    }

    isEarningsReceiverPlatform(): boolean {
        return this.isFarmIdSet() === false && this.isCollectionIdSet() === false;
    }

    isEarningsReceiverFarm(): boolean {
        return this.isFarmIdSet() === true && this.isCollectionIdSet() === false;
    }

    isFarmIdSet(): boolean {
        return this.farmId !== NOT_EXISTS_STRING;
    }

    isCollectionIdSet(): boolean {
        return this.collectionIds !== null;
    }

    shouldFetchCudosEarnings(): boolean {
        return this.currency === EarningsPerDayCurrency.CUDOS || this.currency === EarningsPerDayCurrency.USD;
    }

    shouldFetchBtcEarnings(): boolean {
        return this.currency === EarningsPerDayCurrency.BTC || this.currency === EarningsPerDayCurrency.USD;
    }

    static fromJson(json: EarningsPerDayFilterJsonValidator): EarningsPerDayFilterEntity {
        const entity = new EarningsPerDayFilterEntity();

        entity.timestampFrom = json.timestampFrom ?? entity.timestampFrom;
        entity.timestampTo = json.timestampTo ?? entity.timestampTo;
        entity.currency = json.currency ?? entity.currency;
        entity.farmId = json.farmId ?? entity.farmId;
        entity.collectionIds = json.collectionIds ?? entity.collectionIds;

        return entity;
    }
}
