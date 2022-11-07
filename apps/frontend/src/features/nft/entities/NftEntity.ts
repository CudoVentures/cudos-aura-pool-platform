import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';

export enum NftStatus {
    NOT_LISTED = 1,
    LISTED = 2,
}

export default class NftEntity {

    id: string;
    name: string;
    collectionId: string;
    hashPowerInEH: number;
    price: BigNumber;
    imageUrl: string;
    status: NftStatus;
    expiryDate: Date;
    creatorAddress: string;
    currentOwnerAddress: string;
    farmRoyalties: number;
    maintenanceFee: BigNumber;

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.name = S.Strings.EMPTY;
        this.collectionId = S.Strings.NOT_EXISTS;
        this.hashPowerInEH = S.NOT_EXISTS;
        this.price = new BigNumber(S.NOT_EXISTS);
        this.imageUrl = S.Strings.EMPTY;
        this.status = S.NOT_EXISTS;
        this.expiryDate = S.NOT_EXISTS;
        this.creatorAddress = S.Strings.EMPTY
        this.currentOwnerAddress = S.Strings.EMPTY
        this.farmRoyalties = S.NOT_EXISTS;
        this.maintenanceFee = new BigNumber(S.NOT_EXISTS);

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.id === S.Strings.NOT_EXISTS;
    }

    isStatusListed(): boolean {
        return this.status === NftStatus.LISTED;
    }

    isStatusNotListed(): boolean {
        return this.status === NftStatus.NOT_LISTED;
    }

    isOwnedByAddress(cudosWalletAddress: string): boolean {
        return this.currentOwnerAddress === cudosWalletAddress;
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

    formatHashPowerInEH(): string {
        return `${this.hashPowerInEH !== S.NOT_EXISTS ? this.hashPowerInEH : 0} EH`;
    }

    formatPrice(): string {
        const price = this.price.eq(new BigNumber(S.NOT_EXISTS)) ? new BigNumber(0) : this.price;
        return `${price.toFixed(2)} CUDOS`;
    }

    formatMaintenanceFee(): string {
        return numeral(this.maintenanceFee.toNumber()).format('$0,0.0');
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

    static toJson(entity: NftEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'id': entity.id,
            'name': entity.name,
            'collectionId': entity.collectionId,
            'hashPowerInEH': entity.hashPowerInEH,
            'price': entity.price.toString(),
            'imageUrl': entity.imageUrl,
            'status': entity.status,
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
        model.collectionId = json.collectionId ?? model.collectionId;
        model.hashPowerInEH = Number(json.hashPowerInEH ?? model.hashPowerInEH);
        model.price = new BigNumber(json.price ?? model.price);
        model.imageUrl = json.imageUrl ?? model.imageUrl;
        model.status = Number(json.status ?? model.status);
        model.expiryDate = Number(json.expiryDate ?? model.expiryDate);
        model.creatorAddress = json.creatorAddress ?? model.creatorAddress;
        model.currentOwnerAddress = json.currentOwnerAddress ?? model.currentOwnerAddress;
        model.farmRoyalties = Number(json.farmRoyalties ?? model.farmRoyalties);
        model.maintenanceFee = new BigNumber(json.maintenanceFee ?? model.maintenanceFee);

        return model;
    }

}
