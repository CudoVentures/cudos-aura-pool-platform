import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

export enum CollectionStatus {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    DELETED = 'deleted',
}

export default class CollectionEntity {
    id: string;
    farmId: string;
    name: string;
    denomId: string;
    description: string;
    hashPowerInTh: number;
    profileImgUrl: string;
    coverImgUrl: string;
    status: CollectionStatus;
    royalties: number;
    defaultPricePerNftInCudos: BigNumber;
    defaultHashPowerPerNftInTh: number;
    timestampDeletedAt: number;

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.farmId = S.Strings.NOT_EXISTS;
        this.name = '';
        this.denomId = '';
        this.description = '';
        this.hashPowerInTh = S.NOT_EXISTS;
        this.profileImgUrl = '';
        this.coverImgUrl = '';
        this.status = CollectionStatus.QUEUED;
        this.royalties = S.NOT_EXISTS;
        this.defaultPricePerNftInCudos = null;
        this.defaultHashPowerPerNftInTh = S.NOT_EXISTS;
        this.timestampDeletedAt = S.NOT_EXISTS;

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.id === S.Strings.NOT_EXISTS;
    }

    // TO DO: what will happen when queue collection is updated and approved at the same time
    isEditable(): boolean {
        switch (this.status) {
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

    isStatusQueued(): boolean {
        return this.status === CollectionStatus.QUEUED;
    }

    isStatusRejected(): boolean {
        return this.status === CollectionStatus.REJECTED;
    }

    markQueued() {
        this.status = CollectionStatus.QUEUED;
    }

    markApproved() {
        this.status = CollectionStatus.APPROVED;
    }

    markRejected() {
        this.status = CollectionStatus.REJECTED;
    }

    markDeleted() {
        this.status = CollectionStatus.DELETED;
    }

    formatHashPowerInTh(): string {
        return `${this.hashPowerInTh !== S.NOT_EXISTS ? this.hashPowerInTh : 0} TH`;
    }

    formatStatusName(): string {
        return CollectionEntity.formatStatusName(this.status);
    }

    formatRoyaltiesInPercentage(): string {
        return `${this.royalties !== S.NOT_EXISTS ? this.royalties.toFixed(2) : '0.00'} %`;
    }

    formatDefaultPricePerNftInCudos(): string {
        return `${this.defaultPricePerNftInCudos !== null ? this.defaultPricePerNftInCudos.toFixed(2) : '0.00'} CUDOS`;
    }

    formatDefaultHashPowerPerNftInTh(): string {
        return `${this.defaultHashPowerPerNftInTh !== S.NOT_EXISTS ? this.defaultHashPowerPerNftInTh.toString() : '0.00'} TH`;
    }

    static formatStatusName(status: CollectionStatus): string {
        switch (status) {
            case CollectionStatus.QUEUED:
                return 'Queued';
            case CollectionStatus.APPROVED:
                return 'Approved';
            case CollectionStatus.DELETED:
                return 'Deleted';
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
            'denomId': entity.denomId,
            'description': entity.description,
            'hashingPower': entity.hashPowerInTh,
            'mainImage': entity.profileImgUrl,
            'bannerImage': entity.coverImgUrl,
            'status': entity.status,
            'royalties': entity.royalties,
            'defaultPricePerNftInCudos': entity.defaultPricePerNftInCudos?.toString() ?? null,
            'defaultHashPowerPerNftInTh': entity.defaultHashPowerPerNftInTh,
            'timestampDeletedAt': entity.timestampDeletedAt,
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
        model.denomId = json.denomId ?? model.denomId;
        model.description = json.description ?? model.description;
        model.hashPowerInTh = Number(json.hashing_power ?? model.hashPowerInTh);
        model.profileImgUrl = json.mainImage ?? model.profileImgUrl;
        model.coverImgUrl = json.bannerImage ?? model.coverImgUrl;
        model.status = json.status ?? model.status;
        model.royalties = Number(json.royalties ?? model.royalties);
        model.defaultPricePerNftInCudos = json.defaultPricePerNftInCudos !== null ? new BigNumber(json.defaultPricePerNftInCudos ?? model.defaultPricePerNftInCudos) : null;
        model.defaultHashPowerPerNftInTh = Number(json.defaultHashPowerPerNftInTh ?? model.defaultHashPowerPerNftInTh);
        model.timestampDeletedAt = Number(json.timestampDeletedAt ?? model.timestampDeletedAt);

        return model;
    }
}
