import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

export enum NftStatus {
    NONE = '',
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    MINTED = 'minted',
    EXPIRED = 'expired',
    DELETED = 'deleted',
}

export enum ListStatus {
    NONE = 0,
    NOT_LISTED = 1,
    LISTED = 2,
}

export default class NftEntity {

    id: string;
    collectionId: string;
    name: string;
    tokenId: string;
    hashPowerInTh: number;
    priceInAcudos: BigNumber;
    imageUrl: string;
    status: NftStatus;
    listStatus: ListStatus;
    expiryDate: number;
    creatorAddress: string;
    currentOwnerAddress: string;

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.name = '';
        this.tokenId = '';
        this.collectionId = S.Strings.NOT_EXISTS;
        this.hashPowerInTh = S.NOT_EXISTS;
        this.priceInAcudos = null;
        this.imageUrl = '';
        this.status = NftStatus.NONE;
        this.listStatus = ListStatus.NONE;
        this.expiryDate = S.NOT_EXISTS;
        this.creatorAddress = ''
        this.currentOwnerAddress = ''

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.id === S.Strings.NOT_EXISTS;
    }

    isStatusListed(): boolean {
        return this.listStatus === ListStatus.LISTED;
    }

    isStatusNotListed(): boolean {
        return this.listStatus === ListStatus.NOT_LISTED;
    }

    isOwnedByAddress(cudosWalletAddress: string): boolean {
        return this.currentOwnerAddress === cudosWalletAddress;
    }

    hasImage(): boolean {
        return this.imageUrl !== '';
    }

    formatExpiryDate(): string {
        const periodMilis = this.expiryDate - Date.now();

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
        return `${this.hashPowerInTh !== S.NOT_EXISTS ? this.hashPowerInTh : 0} TH`;
    }

    formatPriceInCudos(): string {
        if (this.priceInAcudos === null) {
            return '0 CUDOS';
        }

        return `${this.priceInAcudos.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER).toFixed(0)} CUDOS`;
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
            'id': parseInt(entity.id),
            'collection_id': parseInt(entity.collectionId),
            'name': entity.name,
            'token_id': entity.tokenId,
            'hashing_power': entity.hashPowerInTh,
            'price': entity.priceInAcudos.toString(),
            'uri': entity.imageUrl,
            'status': entity.status,
            'list_status': entity.listStatus,
            'expiration_date': entity.expiryDate,
            'creator_address': entity.creatorAddress,
            'current_owner_address': entity.currentOwnerAddress,
        }
    }

    static fromJson(json): NftEntity {
        if (json === null) {
            return null;
        }

        const model = new NftEntity();

        model.id = (json.id ?? model.id).toString();
        model.collectionId = (json.collection_id ?? model.collectionId).toString();
        model.name = json.name ?? model.name;
        model.tokenId = json.tokenId ?? model.tokenId;
        model.hashPowerInTh = parseInt(json.hashing_power ?? model.hashPowerInTh);
        model.priceInAcudos = new BigNumber(json.price ?? model.priceInAcudos);
        model.imageUrl = String.fromCharCode(...(json.uri ? json.uri.data : [])) ?? model.imageUrl;
        model.status = json.status ?? model.status;
        model.listStatus = parseInt(json.list_status ?? model.listStatus);
        model.expiryDate = parseInt(json.expiration_date ?? model.expiryDate);
        model.creatorAddress = json.creator_address ?? model.creatorAddress;
        model.currentOwnerAddress = json.current_owner_address ?? model.currentOwnerAddress;

        return model;
    }

}
