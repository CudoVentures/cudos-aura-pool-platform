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
    hashPowerInEH: number;
    profileImgUrl: string;
    coverImgUrl: string;
    status: CollectionStatus;
    royalties: number;
    maintenanceFees: BigNumber;
    payoutAddress: string;
    defaultPricePerNft: BigNumber;
    defaultHashPowerInEHPerNftInEH: number;

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.farmId = S.Strings.NOT_EXISTS;
        this.name = S.Strings.EMPTY;
        this.description = S.Strings.EMPTY;
        this.ownerAddress = S.Strings.EMPTY;
        this.hashPowerInEH = S.NOT_EXISTS;
        this.profileImgUrl = S.Strings.EMPTY;
        this.coverImgUrl = S.Strings.EMPTY;
        this.status = CollectionStatus.NOT_SUBMITTED;
        this.royalties = S.NOT_EXISTS;
        this.maintenanceFees = null;
        this.payoutAddress = S.Strings.EMPTY;
        this.defaultPricePerNft = null;
        this.defaultHashPowerInEHPerNftInEH = S.NOT_EXISTS;

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

    hasDefaultValuesPerNft(): boolean {
        return this.defaultPricePerNft !== null && this.defaultHashPowerInEHPerNftInEH !== S.NOT_EXISTS;
    }

    markQueued() {
        this.status = CollectionStatus.QUEUED
    }

    markApproved() {
        this.status = CollectionStatus.APPROVED;
    }

    formatHashPowerInEH(): string {
        return `${this.hashPowerInEH !== S.NOT_EXISTS ? this.hashPowerInEH : 0} EH`;
    }

    formatStatusName(): string {
        return CollectionEntity.formatStatusName(this.status);
    }

    formatHashRateInEH(): string {
        return `${this.hashPowerInEH === S.NOT_EXISTS ? 0 : this.hashPowerInEH} EH/s`
    }

    formatMaintenanceFees(): string {
        return this.maintenanceFees !== null ? this.maintenanceFees.toFixed(2) : '0.00';
    }

    formatRoyalties(): string {
        return this.royalties !== S.NOT_EXISTS ? this.royalties.toFixed(2) : '0.00';
    }

    formatDefaultPricePerNft(): string {
        return this.defaultPricePerNft !== null ? this.defaultPricePerNft.toFixed(2) : '0.00';
    }

    formatDefaultHashPowerInEHPerNft(): string {
        return this.defaultHashPowerInEHPerNftInEH !== S.NOT_EXISTS ? this.defaultHashPowerInEHPerNftInEH.toString() : '0.00';
    }

    static formatStatusName(status: CollectionStatus): string {
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
            'hashPowerInEH': entity.hashPowerInEH,
            'profileImgUrl': entity.profileImgUrl,
            'coverImgUrl': entity.coverImgUrl,
            'status': entity.status,
            'royalties': entity.royalties,
            'maintenanceFees': entity.maintenanceFees.toString(),
            'payoutAddress': entity.payoutAddress,
            'defaultPricePerNft': entity.defaultPricePerNft.toString(),
            'defaultHashPowerInEHPerNftInEH': entity.defaultHashPowerInEHPerNftInEH,
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
        model.hashPowerInEH = Number(json.hashPowerInEH ?? model.hashPowerInEH);
        model.profileImgUrl = json.profileImgUrl ?? model.profileImgUrl;
        model.coverImgUrl = json.coverImgUrl ?? model.coverImgUrl;
        model.status = json.status ?? model.status;
        model.royalties = Number(json.royalties ?? model.royalties);
        model.maintenanceFees = new BigNumber(json.maintenanceFees ?? model.maintenanceFees);
        model.payoutAddress = json.payoutAddress ?? model.payoutAddress;
        model.defaultPricePerNft = new BigNumber(json.defaultPricePerNft ?? model.defaultPricePerNft);
        model.defaultHashPowerInEHPerNftInEH = parseInt(json.defaultHashPowerInEHPerNftInEH ?? model.defaultHashPowerInEHPerNftInEH);

        return model;
    }
}
