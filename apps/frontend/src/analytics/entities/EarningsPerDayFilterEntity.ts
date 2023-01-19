import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';

export enum EarningsPerDayCurrency {
    CUDOS = 'cudos',
    BTC = 'btc',
    USD = 'usd'
}

export default class EarningsPerDayFilterEntity {
    timestampFrom: number;
    timestampTo: number;
    currency: EarningsPerDayCurrency;
    farmId: string;
    collectionIds: string[];

    constructor() {
        this.timestampFrom = S.NOT_EXISTS;
        this.timestampTo = S.NOT_EXISTS;
        this.currency = EarningsPerDayCurrency.USD;
        this.farmId = S.Strings.NOT_EXISTS;
        this.collectionIds = null;

        this.selectLastMonth();

        makeAutoObservable(this);
    }

    isPlatform(): boolean {
        return this.farmId === S.Strings.NOT_EXISTS;
    }

    isFarm(): boolean {
        return this.farmId !== S.Strings.NOT_EXISTS;
    }

    isCollection(): boolean {
        return this.collectionIds !== null;
    }

    isBtc(): boolean {
        return this.currency === EarningsPerDayCurrency.BTC;
    }

    isCudos(): boolean {
        return this.currency === EarningsPerDayCurrency.CUDOS;
    }

    isUsd(): boolean {
        return this.currency === EarningsPerDayCurrency.USD;
    }

    getSelectedCollection(): string {
        return this.collectionIds?.length > 0 ? this.collectionIds[0] : S.Strings.NOT_EXISTS;
    }

    selectLastMonth() {
        const date = new Date();
        date.clearTime();

        date.setDate(date.getDate() + 1);
        this.timestampTo = date.getTime() - 1;
        date.setMonth(date.getMonth() - 1);
        this.timestampFrom = date.getTime();
    }

    static toJson(entity: EarningsPerDayFilterEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'timestampFrom': entity.timestampFrom,
            'timestampTo': entity.timestampTo,
            'currency': entity.currency,
            'farmId': entity.farmId,
            'collectionIds': entity.collectionIds,
        }
    }
}
