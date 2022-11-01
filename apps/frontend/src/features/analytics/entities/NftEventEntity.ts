import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';

export enum NftEventType {
    TRANSFER = 1,
}

export default class NftEventEntity {

    nftEventId: string;
    nftId: string;
    fromAddress: string;
    toAddress: string;
    eventType: NftEventType;
    transferPriceInCudos: BigNumber;
    transferPriceUsd: number;
    quantity: number;
    timestamp: number;

    constructor() {
        this.nftEventId = S.Strings.NOT_EXISTS;
        this.nftId = S.Strings.NOT_EXISTS;
        this.fromAddress = '';
        this.toAddress = '';
        this.eventType = NftEventType.TRANSFER;
        this.transferPriceInCudos = new BigNumber(S.NOT_EXISTS);
        this.transferPriceUsd = S.NOT_EXISTS;
        this.quantity = 0;
        this.timestamp = S.NOT_EXISTS;

        makeAutoObservable(this);
    }

    getTransferPriceDisplay(): string {
        return `${this.transferPriceInCudos.toFixed(2)} CUDOS`;
    }

    getTransferPriceUsdDisplay(): string {
        return `$${this.transferPriceUsd.toFixed(2)}`;
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
        switch (this.eventType) {
            case NftEventType.TRANSFER:
                return 'Transfer';
            default:
                return '';
        }
    }

    static toJson(entity: NftEventEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'nftEventId': entity.nftEventId,
            'nftId': entity.nftId,
            'fromAddress': entity.fromAddress,
            'toAddress': entity.toAddress,
            'eventType': entity.eventType,
            'transferPriceInCudos': entity.transferPriceInCudos.toString(),
            'transferPriceUsd': entity.transferPriceUsd,
            'quantity': entity.quantity,
            'timestamp': entity.timestamp,
        }
    }

    static fromJson(json: any): NftEventEntity {
        if (json === null) {
            return null;
        }

        const entity = new NftEventEntity();

        entity.nftEventId = (json.this.nftEventId ?? entity.nftEventId).toString();
        entity.nftId = (json.this.nftId ?? entity.nftId).toString();
        entity.fromAddress = json.this.fromAddress ?? entity.fromAddress;
        entity.toAddress = json.this.toAddress ?? entity.toAddress;
        entity.eventType = parseInt(json.this.eventType ?? entity.eventType);
        entity.transferPriceInCudos = new BigNumber(json.this.transferPriceInCudos ?? entity.transferPriceInCudos);
        entity.transferPriceUsd = parseFloat(json.this.transferPriceUsd ?? entity.transferPriceUsd);
        entity.quantity = parseInt(json.this.quantity ?? entity.quantity);
        entity.timestamp = parseInt(json.this.timestamp ?? entity.timestamp);

        return entity;
    }

}
