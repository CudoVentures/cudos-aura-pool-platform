import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';

enum EventActivity {
    NONE = 1,
    TRANSFER = 2,
}

export default class CollectionEventEntity {
    collectionEventId: string
    fromAddress: string;
    activity: EventActivity;
    collectionId: string;
    quantity: number;
    transferPrice: BigNumber;
    toAddress: string;
    timestamp: number;

    constructor() {
        this.collectionEventId = S.Strings.NOT_EXISTS;
        this.fromAddress = S.Strings.EMPTY;
        this.activity = EventActivity.NONE;
        this.collectionId = S.Strings.NOT_EXISTS;
        this.quantity = S.NOT_EXISTS;
        this.transferPrice = new BigNumber(S.NOT_EXISTS);
        this.toAddress = S.Strings.EMPTY;

        this.timestamp = S.NOT_EXISTS;

        makeAutoObservable(this);
    }

    static toJson(entity: CollectionEventEntity) {
        if (entity === null) {
            return null;
        }

        return {
            collectionEventId: entity.collectionEventId,
            fromAddress: entity.fromAddress,
            activity: entity.activity,
            collectionId: entity.collectionId,
            quantity: entity.quantity,
            transferPrice: entity.transferPrice.toString(),
            toAddress: entity.toAddress,
            timestamp: entity.timestamp,
        }
    }

    static fromJson(json): CollectionEventEntity {
        if (json === null) {
            return null;
        }

        const model = new CollectionEventEntity();

        model.collectionEventId = json.collectionEventId || model.collectionEventId;
        model.fromAddress = json.fromAddress || model.fromAddress;
        model.activity = parseInt(json.activity || model.activity);
        model.collectionId = json.collectionId || model.collectionId;
        model.quantity = parseInt(json.quantity || model.quantity);
        model.transferPrice = new BigNumber(json.transferPrice || model.transferPrice);
        model.toAddress = json.toAddress || model.toAddress;
        model.timestamp = parseInt(json.timestamp || model.timestamp);

        return model;
    }

    getTransferPriceDisplay(): string {
        return `${this.transferPrice.toFixed(2)} CUDOS`;
    }

    getTransferPriceUsdDisplay(cudosPriceUsd: number): string {
        const transferPriceUsd = this.transferPrice.multipliedBy(cudosPriceUsd);

        return `$${transferPriceUsd.toFixed(2)}`;
    }

    getTimePassedDisplay(): string {
        const timeSecondsPassed = (Date.now() - this.timestamp) / 1000;
        const secondsInMinute = 60;
        const minutesInHour = 60;
        const hoursInDay = 24;
        const secondsInHour = secondsInMinute * minutesInHour;
        const secondsInDay = secondsInHour * hoursInDay;

        if (timeSecondsPassed / secondsInMinute < minutesInHour) {
            const minutes = Math.ceil(timeSecondsPassed / secondsInMinute);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }

        if (timeSecondsPassed / secondsInHour < hoursInDay) {
            const hours = Math.ceil(timeSecondsPassed / secondsInHour);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }

        const days = Math.ceil(timeSecondsPassed / secondsInDay);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    getEventActivityDisplayName(): string {
        switch (this.activity) {
            case EventActivity.TRANSFER:
                return 'Transfer';
            default:
                return '';
        }
    }
}
