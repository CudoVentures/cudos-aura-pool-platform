import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';

export enum NftListinStatus {
    NOT_LISTED,
    LISTED
}

export default class NftEntity {
    id: string;
    name: string;
    category: string;
    collectionId: string;
    hashPower: number;
    price: BigNumber;
    imageUrl: string;
    listingStatus: number;
    expiryDate: number;
    creatorAddress: string;
    currentOwnerAddress: string;
    farmRoyalties: number;
    maintenanceFee: BigNumber;

    constructor() {
        this.id = S.Strings.EMPTY;
        this.name = S.Strings.EMPTY;
        this.collectionId = S.Strings.EMPTY;
        this.hashPower = S.NOT_EXISTS;
        this.price = new BigNumber(S.NOT_EXISTS);
        this.imageUrl = S.Strings.EMPTY;
        this.listingStatus = S.NOT_EXISTS;
        this.expiryDate = S.NOT_EXISTS;
        this.creatorAddress = S.Strings.EMPTY
        this.currentOwnerAddress = S.Strings.EMPTY
        this.farmRoyalties = S.NOT_EXISTS;
        this.maintenanceFee = new BigNumber(S.NOT_EXISTS);

        makeAutoObservable(this);
    }

    static toJson(entity: NftEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'id': entity.id,
            'name': entity.name,
            'category': entity.category,
            'collectionId': entity.collectionId,
            'hashPower': entity.hashPower,
            'price': entity.price.toString(),
            'imageUrl': entity.imageUrl,
            'listingStatus': entity.listingStatus,
            'expiryDate': entity.expiryDate,
            'creatorAddress': entity.creatorAddress,
            'currentOwnerAddress': entity.currentOwnerAddress,
            'farmRoyalties': entity.currentOwnerAddress,
            'maintenanceFee': entity.currentOwnerAddress.toString(),
        }
    }

    static fromJson(json): NftEntity {
        if (json === null) {
            return null;
        }

        const model = new NftEntity();

        model.id = json.id ?? model.id;
        model.name = json.name ?? model.name;
        model.category = json.category ?? model.category;
        model.collectionId = json.collectionId ?? model.collectionId;
        model.hashPower = Number(json.hashPower ?? model.hashPower);
        model.price = new BigNumber(json.price ?? model.price);
        model.imageUrl = json.imageUrl ?? model.imageUrl;
        model.listingStatus = Number(json.listingStatus ?? model.listingStatus);
        model.expiryDate = Number(json.expiryDate ?? model.expiryDate);
        model.creatorAddress = json.creatorAddress ?? model.creatorAddress;
        model.currentOwnerAddress = json.currentOwnerAddress ?? model.currentOwnerAddress;
        model.farmRoyalties = Number(json.farmRoyalties ?? model.farmRoyalties);
        model.maintenanceFee = new BigNumber(json.maintenanceFee ?? model.maintenanceFee);

        return model;
    }

    cloneDeep(): NftEntity {
        const newNftEntity = Object.assign(new NftEntity(), this);

        newNftEntity.price = new BigNumber(this.price);
        newNftEntity.maintenanceFee = new BigNumber(this.maintenanceFee);

        return newNftEntity;
    }

    copyDeepFrom(nftEntity: NftEntity): void {
        Object.assign(this, nftEntity);
        this.price = new BigNumber(nftEntity.price);
        this.maintenanceFee = new BigNumber(nftEntity.maintenanceFee);
    }

    getExpiryDisplay(): string {
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

    getHashPowerDisplay(): string {
        const hashPower = this.hashPower !== S.NOT_EXISTS ? this.hashPower : 0;

        if (hashPower < 1000) {
            return `${hashPower} TH/s`;
        }

        if (hashPower / 1000 < 1000) {
            return `${(hashPower / 1000).toFixed(2)} PH/s`;
        }

        if (hashPower / 1000000 < 1000) {
            return `${(hashPower / 1000000).toFixed(2)} EH/s`;
        }

        return S.Strings.EMPTY;

    }

    getPriceDisplay(): string {
        const price = this.price.eq(new BigNumber(S.NOT_EXISTS)) ? new BigNumber(0) : this.price;

        return `${price.toFixed(2)} CUDOS`;
    }

    getMaintenanceFeeDisplay(): string {
        const maintenanceFee = this.maintenanceFee.eq(new BigNumber(S.NOT_EXISTS)) ? new BigNumber(0) : this.maintenanceFee;

        return `${maintenanceFee.toFixed(2)}$`;
    }

}
