import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';
import ProjectUtils from '../../core/utilities/ProjectUtils';
import { NftTransferHistoryEventType } from '../../../../backend/src/statistics/entities/nft-event.entity';

export default class MegaWalletEventEntity {

    nftId: string;
    fromAddress: string;
    timestamp: number;
    eventType: NftTransferHistoryEventType;
    transferPriceInUsd: number;
    transferPriceInAcudos: BigNumber;

    constructor() {
        this.nftId = S.Strings.NOT_EXISTS;
        this.fromAddress = '';
        this.eventType = NftTransferHistoryEventType.MINT;
        this.transferPriceInAcudos = new BigNumber(S.NOT_EXISTS);
        this.transferPriceInUsd = S.NOT_EXISTS;
        this.timestamp = S.NOT_EXISTS;

        makeAutoObservable(this);
    }

    hasPrice(): boolean {
        return this.transferPriceInAcudos.eq(new BigNumber(S.NOT_EXISTS)) === false;
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
            case NftTransferHistoryEventType.MINT:
                return 'Mint';
            case NftTransferHistoryEventType.SALE:
                return 'Sale';
            case NftTransferHistoryEventType.TRANSFER:
                return 'Transfer';
            default:
                return '';
        }
    }

    static toJson(entity: MegaWalletEventEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'nftId': entity.nftId,
            'fromAddress': entity.fromAddress,
            'eventType': entity.eventType,
            'transferPriceInAcudos': entity.transferPriceInAcudos.toString(10),
            'transferPriceInUsd': entity.transferPriceInUsd,
            'timestamp': entity.timestamp,
        }
    }

    static fromJson(json: any): MegaWalletEventEntity {
        if (json === null) {
            return null;
        }

        const entity = new MegaWalletEventEntity();

        entity.nftId = (json.nftId ?? entity.nftId).toString();
        entity.fromAddress = json.fromAddress ?? entity.fromAddress;
        entity.eventType = parseInt(json.eventType ?? entity.eventType);
        entity.transferPriceInAcudos = new BigNumber(json.transferPriceInAcudos ?? entity.transferPriceInAcudos);
        entity.transferPriceInUsd = parseFloat(json.transferPriceInUsd ?? entity.transferPriceInUsd);
        entity.timestamp = parseInt(json.timestamp ?? entity.timestamp);

        return entity;
    }

}
