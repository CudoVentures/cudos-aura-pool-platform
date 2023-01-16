import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';
import ProjectUtils from '../../core/utilities/ProjectUtils';

export enum NftStatus {
    QUEUED = 'queued',
    MINTED = 'minted',
    REMOVED = 'removed',
}

export default class NftEntity {

    id: string;
    collectionId: string;
    marketplaceNftId: string;
    creatorId: string;
    name: string;
    tokenId: string;
    hashPowerInTh: number;
    priceInAcudos: BigNumber;
    imageUrl: string;
    status: NftStatus;
    expirationDateTimestamp: number;
    currentOwner: string;
    data: string;

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.name = '';
        this.tokenId = '';
        this.creatorId = '';
        this.marketplaceNftId = '';
        this.collectionId = S.Strings.NOT_EXISTS;
        this.hashPowerInTh = S.NOT_EXISTS;
        this.priceInAcudos = null;
        this.imageUrl = '';
        this.status = NftStatus.QUEUED;
        this.expirationDateTimestamp = S.NOT_EXISTS;
        this.currentOwner = ''
        this.data = ''

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.id === S.Strings.NOT_EXISTS;
    }

    isMinted(): boolean {
        return this.status === NftStatus.MINTED
    }

    isStatusListed(): boolean {
        return this.priceInAcudos.gt(new BigNumber(0));
    }

    isStatusNotListed(): boolean {
        return this.priceInAcudos.eq(new BigNumber(0));
    }

    isOwnedByAddress(cudosWalletAddress: string): boolean {
        return this.currentOwner === cudosWalletAddress;
    }

    hasImage(): boolean {
        return this.imageUrl !== '';
    }

    formatExpiryDate(): string {
        const periodMilis = this.expirationDateTimestamp - Date.now();

        if (periodMilis < 0) {
            return 'Expired';
        }

        let delta = periodMilis / 1000;
        const hour = 3600; // 3600 seconds
        const day = 24 * hour // 24 hours
        const year = day * 365 // 365 days

        const years = Math.floor(delta / year);
        delta -= years * year;

        // calculate (and subtract) whole days
        const days = Math.floor(delta / day);
        delta -= days * day;

        // calculate (and subtract) whole hours
        const hours = Math.floor(delta / hour) % 24;
        delta -= hours * hour;

        return `${years} years, ${days} days, ${hours} hours`;
    }

    formatHashPowerInTh(): string {
        return `${this.hashPowerInTh !== S.NOT_EXISTS ? this.hashPowerInTh : 0} TH/s`;
    }

    formatPriceInCudos(): string {
        if (this.priceInAcudos === null) {
            return '0 CUDOS';
        }

        return `${this.priceInAcudos.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER).toFixed(0)} CUDOS`;
    }

    formatPricePlusMintFeeInCudos(): string {
        if (this.priceInAcudos === null) {
            return '0 CUDOS';
        }

        let previewPrice = this.priceInAcudos.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER);
        if (this.isMinted() === false) {
            previewPrice = previewPrice.plus(1);
        }

        return `${previewPrice.toFixed(0)} CUDOS`;
    }

    cloneDeep(): NftEntity {
        const newNftEntity = Object.assign(new NftEntity(), this);

        newNftEntity.priceInAcudos = this.priceInAcudos !== null ? new BigNumber(this.priceInAcudos) : null;

        return newNftEntity;
    }

    copyDeepFrom(nftEntity: NftEntity): void {
        Object.assign(this, nftEntity);
        this.priceInAcudos = nftEntity.priceInAcudos !== null ? new BigNumber(nftEntity.priceInAcudos) : null;
    }

    static toJson(entity: NftEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'id': entity.id,
            'collectionId': entity.collectionId,
            'marketplaceNftId': entity.marketplaceNftId,
            'creatorId': entity.creatorId,
            'name': entity.name,
            'tokenId': entity.tokenId,
            'hashingPower': entity.hashPowerInTh,
            'priceInAcudos': entity.priceInAcudos.toString(),
            'uri': entity.imageUrl,
            'status': entity.status,
            'expirationDateTimestamp': entity.expirationDateTimestamp,
            'currentOwner': entity.currentOwner,
            'data': entity.data,
        }
    }

    static fromJson(json): NftEntity {
        if (json === null) {
            return null;
        }

        const model = new NftEntity();

        model.id = json.id ?? model.id;
        model.collectionId = json.collectionId ?? model.collectionId;
        model.marketplaceNftId = json.marketplaceNftId ?? model.marketplaceNftId;
        model.name = json.name ?? model.name;
        model.tokenId = json.tokenId ?? model.tokenId;
        model.hashPowerInTh = parseInt(json.hashingPower ?? model.hashPowerInTh);
        model.priceInAcudos = new BigNumber(json.priceInAcudos ?? model.priceInAcudos);
        model.imageUrl = json.uri ?? model.imageUrl;
        model.status = json.status ?? model.status;
        model.expirationDateTimestamp = new Date(json.expirationDateTimestamp ?? model.expirationDateTimestamp).getTime();
        model.creatorId = json.creatorId ?? model.creatorId;
        model.currentOwner = json.currentOwner ?? model.currentOwner;
        model.data = json.data ?? model.data;

        return model;
    }

}
