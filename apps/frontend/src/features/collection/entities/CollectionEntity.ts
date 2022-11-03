import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';

export enum CollectionStatus {
    NOT_SUBMITTED = 'not_submitted',
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ISSUED = 'issued',
    DELETED = 'deleted',
    ANY = 'any'
}

export default class CollectionEntity {
    id: string;
    farmId: string;
    name: string;
    description: string;
    ownerAddress: string;
    hashPower: number;
    price: BigNumber;
    volume: BigNumber;
    items: number;
    owners: number;
    profileImgUrl: string;
    coverImgUrl: string;
    status: CollectionStatus;
    royalties: number;
    maintenanceFees: BigNumber;
    payoutAddress: string;

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.farmId = S.Strings.NOT_EXISTS;
        this.name = S.Strings.EMPTY;
        this.description = S.Strings.EMPTY;
        this.ownerAddress = S.Strings.EMPTY;
        this.hashPower = S.NOT_EXISTS;
        this.price = new BigNumber(S.NOT_EXISTS);
        this.volume = new BigNumber(S.NOT_EXISTS);
        this.items = S.NOT_EXISTS;
        this.owners = S.NOT_EXISTS;
        this.profileImgUrl = S.Strings.EMPTY;
        this.coverImgUrl = S.Strings.EMPTY;
        this.status = CollectionStatus.NOT_SUBMITTED;
        this.royalties = S.NOT_EXISTS;
        this.maintenanceFees = new BigNumber(S.NOT_EXISTS);
        this.payoutAddress = S.Strings.EMPTY;

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.id === S.Strings.NOT_EXISTS;
    }

    // TO DO: what will happen when queue collection is updated and approved at the same time
    isEditable(): boolean {
        switch (this.status) {
            case CollectionStatus.NOT_SUBMITTED:
            case CollectionStatus.QUEUED:
                return true;
            default:
                return false;
        }
    }

    markQueued() {
        this.status = CollectionStatus.QUEUED
    }

    markApproved() {
        this.status = CollectionStatus.APPROVED;
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

    getStatusDisplayName(): string {
        return CollectionEntity.getStatusDisplayName(this.status);
    }

    static getStatusDisplayName(status: CollectionStatus): string {
        switch (status) {
            case CollectionStatus.NOT_SUBMITTED:
                return 'Not submitted';
            case CollectionStatus.QUEUED:
                return 'Queued';
            case CollectionStatus.APPROVED:
                return 'Approved';
            case CollectionStatus.REJECTED:
                return 'Rejected';
            case CollectionStatus.ISSUED:
                return 'Issued';
            case CollectionStatus.DELETED:
                return 'Deleted';
            case CollectionStatus.ANY:
            default:
                return 'Any';
        }
    }

    static toJson(entity: CollectionEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'id': entity.id,
            'farmId': entity.farmId,
            'name': entity.name,
            'description': entity.description,
            'ownerAddress': entity.ownerAddress,
            'hashPower': entity.hashPower,
            'price': entity.price.toString(),
            'volume': entity.volume.toString(),
            'items': entity.items,
            'owners': entity.owners,
            'profileImgUrl': entity.profileImgUrl,
            'coverImgUrl': entity.coverImgUrl,
            'status': entity.status,
            'royalties': entity.royalties,
            'maintenanceFees': entity.maintenanceFees.toString(),
            'payoutAddress': entity.payoutAddress,
        }
    }

    static fromJson(json): CollectionEntity {
        if (json === null) {
            return null;
        }

        const model = new CollectionEntity();

        model.id = json.id ?? model.id;
        model.farmId = json.farmId ?? model.farmId;
        model.name = json.name ?? model.name;
        model.description = json.description ?? model.description;
        model.ownerAddress = json.ownerAddress ?? model.ownerAddress;
        model.hashPower = Number(json.hashPower ?? model.hashPower);
        model.price = new BigNumber(json.price ?? model.price);
        model.volume = new BigNumber(json.volume ?? model.volume);
        model.items = Number(json.items ?? model.items);
        model.owners = Number(json.owners ?? model.owners);

        model.profileImgUrl = json.profileImgUrl ?? model.profileImgUrl;
        model.coverImgUrl = json.coverImgUrl ?? model.coverImgUrl;
        model.status = json.status ?? model.status;
        model.royalties = Number(json.royalties ?? model.royalties);
        model.maintenanceFees = new BigNumber(json.maintenanceFees ?? model.maintenanceFees);
        model.payoutAddress = json.payoutAddress ?? model.payoutAddress;

        return model;
    }

    hashRateDisplay(): string {
        // TODO: calculate EH or TH or w/e

        return `${this.hashPower === S.NOT_EXISTS ? 0 : this.hashPower} EH/s`
    }

    priceDisplay(): string {
        // TODO: calculate K or M or w/e

        return `${this.price.toFixed(0)}K CUDOS`
    }

    priceUsdDisplay(cudosInUsd: number) {
        // TODO calculate M or B or w/e

        return `$${this.price.multipliedBy(cudosInUsd).toFixed(1)}K`
    }

    getMaintenanceFeesDisplay(): string {
        const fees = this.maintenanceFees.eq(new BigNumber(S.NOT_EXISTS)) === true ? new BigNumber(0) : this.maintenanceFees;

        return fees.toFixed(2);
    }

    getRoyaltiesDisplay(): string {
        const royalties = this.royalties === S.NOT_EXISTS ? 0 : this.maintenanceFees;

        return royalties.toFixed(2);
    }
}
