import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

export enum NftEventType {
    TRANSFER = 1,
    MINT = 2,
}

export default class NftEventEntity {

    nftEventId: string;
    nftId: string;
    fromAddress: string;
    toAddress: string;
    eventType: NftEventType;
    transferPriceInAcudos: BigNumber;
    transferPriceInUsd: number;
    quantity: number;
    timestamp: number;

    constructor() {
        this.nftEventId = S.Strings.NOT_EXISTS;
        this.nftId = S.Strings.NOT_EXISTS;
        this.fromAddress = '';
        this.toAddress = '';
        this.eventType = NftEventType.TRANSFER;
        this.transferPriceInAcudos = new BigNumber(S.NOT_EXISTS);
        this.transferPriceInUsd = S.NOT_EXISTS;
        this.quantity = 0;
        this.timestamp = S.NOT_EXISTS;

        makeAutoObservable(this);
    }

    formatTransferPriceInCudos(): string {
        return `${this.transferPriceInAcudos.div(ProjectUtils.CUDOS_CURRENCY_DIVIDER).toFixed(2)} CUDOS`;
    }

    formatTransferPriceInUsd(): string {
        return numeral(this.transferPriceInUsd).format(ProjectUtils.NUMERAL_USD);
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
            'transferPriceInAcudos': entity.transferPriceInAcudos.toString(),
            'transferPriceInUsd': entity.transferPriceInUsd,
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
        entity.transferPriceInAcudos = new BigNumber(json.this.transferPriceInAcudos ?? entity.transferPriceInAcudos);
        entity.transferPriceInUsd = parseFloat(json.this.transferPriceInUsd ?? entity.transferPriceInUsd);
        entity.quantity = parseInt(json.this.quantity ?? entity.quantity);
        entity.timestamp = parseInt(json.this.timestamp ?? entity.timestamp);

        return entity;
    }

}
