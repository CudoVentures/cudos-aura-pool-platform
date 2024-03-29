import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';
import { formatCudos, formatUsd } from '../../core/utilities/NumberFormatter';
import CudosStore from '../../cudos-data/presentation/stores/CudosStore';

export enum NftEventType {
    TRANSFER = 1,
    MINT = 2,
    SALE = 3,
}

export default class NftEventEntity {

    nftId: string;
    denomId: string;
    tokenId: string;
    fromAddress: string;
    toAddress: string;
    eventType: NftEventType;
    transferPriceInAcudos: BigNumber;
    transferPriceInBtc: BigNumber;
    transferPriceInUsd: number;
    timestamp: number;
    txHash: string;

    constructor() {
        this.nftId = S.Strings.NOT_EXISTS;
        this.denomId = S.Strings.NOT_EXISTS;
        this.tokenId = S.Strings.NOT_EXISTS;
        this.fromAddress = '';
        this.toAddress = '';
        this.eventType = NftEventType.TRANSFER;
        this.transferPriceInAcudos = new BigNumber(S.NOT_EXISTS);
        this.transferPriceInBtc = new BigNumber(S.NOT_EXISTS);
        this.transferPriceInUsd = S.NOT_EXISTS;
        this.timestamp = S.NOT_EXISTS;
        this.txHash = '';

        makeAutoObservable(this);
    }

    hasPrice(): boolean {
        return this.transferPriceInAcudos.eq(new BigNumber(S.NOT_EXISTS)) === false;
    }

    formatTransferPriceInCudos(): string {
        return formatCudos(CudosStore.convertAcudosInCudos(this.transferPriceInAcudos), true);
    }

    formatTransferPriceInUsd(): string {
        return formatUsd(this.transferPriceInUsd)
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
            case NftEventType.MINT:
                return 'Mint';
            case NftEventType.SALE:
                return 'Sale';
            default:
                return '';
        }
    }

    formatFromAddress(): string {
        return this.fromAddress === '0x0' ? '-' : this.fromAddress;
    }

    static toJson(entity: NftEventEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'nftId': entity.nftId,
            'tokenId': entity.tokenId,
            'denomId': entity.denomId,
            'fromAddress': entity.fromAddress,
            'toAddress': entity.toAddress,
            'eventType': entity.eventType,
            'transferPriceInAcudos': entity.transferPriceInAcudos.toString(10),
            'transferPriceInBtc': entity.transferPriceInBtc.toString(10),
            'transferPriceInUsd': entity.transferPriceInUsd,
            'timestamp': entity.timestamp,
            'txHash': entity.txHash,
        }
    }

    static fromJson(json: any): NftEventEntity {
        if (json === null) {
            return null;
        }

        const entity = new NftEventEntity();

        entity.nftId = (json.nftId ?? entity.nftId).toString();
        entity.tokenId = json.tokenId ?? entity.tokenId;
        entity.denomId = json.denomId ?? entity.denomId;
        entity.fromAddress = json.fromAddress ?? entity.fromAddress;
        entity.toAddress = json.toAddress ?? entity.toAddress;
        entity.eventType = parseInt(json.eventType ?? entity.eventType);
        entity.transferPriceInAcudos = new BigNumber(json.transferPriceInAcudos ?? entity.transferPriceInAcudos);
        entity.transferPriceInBtc = new BigNumber(json.transferPriceInBtc ?? entity.transferPriceInBtc);
        entity.transferPriceInUsd = parseFloat(json.transferPriceInUsd ?? entity.transferPriceInUsd);
        entity.timestamp = parseInt(json.timestamp ?? entity.timestamp);
        entity.txHash = json.txHash ?? entity.txHash;

        return entity;
    }

}
