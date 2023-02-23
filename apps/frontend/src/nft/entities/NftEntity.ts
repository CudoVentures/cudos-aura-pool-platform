import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';
import { NOT_EXISTS_INT } from '../../../../backend/src/common/utils';
import S from '../../core/utilities/Main';
import ProjectUtils from '../../core/utilities/ProjectUtils';

export enum NftStatus {
    QUEUED = 'queued',
    MINTED = 'minted',
    REMOVED = 'removed',
}

export enum NftGroup {
    GIVEAWAY = 'giveaway',
    PRIVATE_SALE = 'private_sale',
    PRESALE = 'presale',
    PUBLIC_SALE = 'public_sale',
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
    group: NftGroup;
    priceUsd: number;
    priceAcudosValidUntil: number;
    updatedAt: number;
    deletedAt: number;
    createdAt: number;

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
        this.currentOwner = '';
        this.group = NftGroup.PUBLIC_SALE;
        this.priceUsd = S.NOT_EXISTS;
        this.priceAcudosValidUntil = S.NOT_EXISTS;
        this.updatedAt = S.NOT_EXISTS;
        this.deletedAt = S.NOT_EXISTS;
        this.createdAt = S.NOT_EXISTS;

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.id === S.Strings.NOT_EXISTS;
    }

    isMinted(): boolean {
        return this.status === NftStatus.MINTED
    }

    isStatusListed(): boolean {
        return (this.isMinted() && this.priceInAcudos.gt(new BigNumber(0))) || (this.isMinted() === false && this.priceUsd !== NOT_EXISTS_INT);
    }

    isStatusNotListed(): boolean {
        return !this.isStatusListed();
    }

    isOwnedByAddress(cudosWalletAddress: string): boolean {
        return this.currentOwner === cudosWalletAddress;
    }

    hasImage(): boolean {
        return this.imageUrl !== '';
    }

    // hasPriceInAcudos(): boolean {
    //     return this.priceInAcudos?.gt(new BigNumber(0)) ?? false;
    // }

    markAsMinted(): void {
        this.status = NftStatus.MINTED;
    }

    setPricesZero(): void {
        this.priceInAcudos = new BigNumber(0);
        this.priceUsd = NOT_EXISTS_INT;
    }

    markAsExpiringToday() {
        this.expirationDateTimestamp = ProjectUtils.getEndOfTodaysTimestamp();
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

    formatPriceInUsd(): string {
        return numeral(this.priceUsd).format(ProjectUtils.NUMERAL_USD);
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
            'priceInAcudos': entity.priceInAcudos?.toString(10) ?? '0',
            'uri': entity.imageUrl,
            'status': entity.status,
            'expirationDateTimestamp': entity.expirationDateTimestamp,
            'currentOwner': entity.currentOwner,
            'group': entity.group,
            'priceUsd': entity.priceUsd,
            'priceAcudosValidUntil': entity.priceAcudosValidUntil,
            'updatedAt': entity.updatedAt,
            'deletedAt': entity.deletedAt,
            'createdAt': entity.createdAt,
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
        model.expirationDateTimestamp = json.expirationDateTimestamp ?? model.expirationDateTimestamp;
        model.creatorId = json.creatorId ?? model.creatorId;
        model.currentOwner = json.currentOwner ?? model.currentOwner;
        model.group = json.group ?? model.group;
        model.priceUsd = json.priceUsd ?? model.priceUsd;
        model.priceAcudosValidUntil = json.priceAcudosValidUntil ?? model.priceAcudosValidUntil;
        model.updatedAt = new Date(json.updatedAt ?? model.updatedAt).getTime();
        model.deletedAt = new Date(json.deletedAt ?? model.deletedAt).getTime();
        model.createdAt = new Date(json.createdAt ?? model.createdAt).getTime();

        return model;
    }

}
