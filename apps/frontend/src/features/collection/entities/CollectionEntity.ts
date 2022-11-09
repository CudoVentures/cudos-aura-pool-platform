import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

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
    hashPowerInTh: number;
    profileImgUrl: string;
    coverImgUrl: string;
    status: CollectionStatus;
    royalties: number;
    maintenanceFeeInBtc: BigNumber;
    payoutAddress: string;
    defaultPricePerNftInCudos: BigNumber;
    defaultHashPowerPerNftInTh: number;

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.farmId = S.Strings.NOT_EXISTS;
        this.name = '';
        this.description = '';
        this.hashPowerInTh = S.NOT_EXISTS;
        this.profileImgUrl = '';
        this.coverImgUrl = '';
        this.status = CollectionStatus.NOT_SUBMITTED;
        this.royalties = S.NOT_EXISTS;
        this.maintenanceFeeInBtc = null;
        this.payoutAddress = '';
        this.defaultPricePerNftInCudos = null;
        this.defaultHashPowerPerNftInTh = S.NOT_EXISTS;

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
        return this.defaultPricePerNftInCudos !== null && this.defaultHashPowerPerNftInTh !== S.NOT_EXISTS;
    }

    hasImages(): boolean {
        return this.profileImgUrl !== '' && this.coverImgUrl !== '';
    }

    hasHashPowerInTh(): boolean {
        return this.hashPowerInTh !== S.NOT_EXISTS;
    }

    getDefaultPricePerNftInAcudos(): BigNumber {
        return this.defaultPricePerNftInCudos.multipliedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER);
    }

    markQueued() {
        this.status = CollectionStatus.QUEUED
    }

    markApproved() {
        this.status = CollectionStatus.APPROVED;
    }

    formatHashPowerInTh(): string {
        return `${this.hashPowerInTh !== S.NOT_EXISTS ? this.hashPowerInTh : 0} TH`;
    }

    formatStatusName(): string {
        return CollectionEntity.formatStatusName(this.status);
    }

    formatMaintenanceFeesInBtc(): string {
        return this.maintenanceFeeInBtc !== null ? this.maintenanceFeeInBtc.toFixed(2) : '0.00';
    }

    formatRoyalties(): string {
        return this.royalties !== S.NOT_EXISTS ? this.royalties.toFixed(2) : '0.00';
    }

    formatDefaultPricePerNftInCudos(): string {
        return this.defaultPricePerNftInCudos !== null ? this.defaultPricePerNftInCudos.toFixed(2) : '0.00';
    }

    formatDefaultHashPowerPerNftInTh(): string {
        return this.defaultHashPowerPerNftInTh !== S.NOT_EXISTS ? this.defaultHashPowerPerNftInTh.toString() : '0.00';
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
            'hashPowerInTh': entity.hashPowerInTh,
            'profileImgUrl': entity.profileImgUrl,
            'coverImgUrl': entity.coverImgUrl,
            'status': entity.status,
            'royalties': entity.royalties,
            'maintenanceFeeInBtc': entity.maintenanceFeeInBtc.toString(),
            'payoutAddress': entity.payoutAddress,
            'defaultPricePerNftInCudos': entity.defaultPricePerNftInCudos?.toString() ?? null,
            'defaultHashPowerPerNftInTh': entity.defaultHashPowerPerNftInTh,
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
        model.hashPowerInTh = Number(json.hashPowerInTh ?? model.hashPowerInTh);
        model.profileImgUrl = json.profileImgUrl ?? model.profileImgUrl;
        model.coverImgUrl = json.coverImgUrl ?? model.coverImgUrl;
        model.status = json.status ?? model.status;
        model.royalties = Number(json.royalties ?? model.royalties);
        model.maintenanceFeeInBtc = new BigNumber(json.maintenanceFeeInBtc ?? model.maintenanceFeeInBtc);
        model.payoutAddress = json.payoutAddress ?? model.payoutAddress;
        model.defaultPricePerNftInCudos = json.defaultPricePerNftInCudos !== null ? new BigNumber(json.defaultPricePerNftInCudos ?? model.defaultPricePerNftInCudos) : null;
        model.defaultHashPowerPerNftInTh = parseInt(json.defaultHashPowerPerNftInTh ?? model.defaultHashPowerPerNftInTh);

        return model;
    }
}
