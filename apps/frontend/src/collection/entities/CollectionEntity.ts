import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';
import { formatPercent, formatTHs, formatUsd } from '../../core/utilities/NumberFormatter';

export enum CollectionStatus {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    DELETED = 'deleted',
}

export default class CollectionEntity {
    id: string;
    farmId: string;
    creatorId: string;
    name: string;
    denomId: string;
    description: string;
    hashPowerInTh: number;
    profileImgUrl: string;
    coverImgUrl: string;
    status: CollectionStatus;
    royalties: number;
    defaultArtistName: string;
    defaultPricePerNftInUsd: number;
    defaultHashPowerPerNftInTh: number;
    timestampDeletedAt: number;
    timestampUpdatedAt: number;

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.farmId = S.Strings.NOT_EXISTS;
        this.creatorId = S.Strings.NOT_EXISTS;
        this.name = '';
        this.denomId = '';
        this.description = '';
        this.hashPowerInTh = S.NOT_EXISTS;
        this.profileImgUrl = '';
        this.coverImgUrl = '';
        this.status = CollectionStatus.QUEUED;
        this.royalties = S.NOT_EXISTS;
        this.defaultArtistName = '';
        this.defaultPricePerNftInUsd = S.NOT_EXISTS;
        this.defaultHashPowerPerNftInTh = S.NOT_EXISTS;
        this.timestampDeletedAt = S.NOT_EXISTS;
        this.timestampUpdatedAt = S.NOT_EXISTS;

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
            case CollectionStatus.REJECTED:
                return true;
            default:
                return false;
        }
    }

    hasDefaultValuesPerNft(): boolean {
        return this.defaultPricePerNftInUsd !== S.NOT_EXISTS && this.defaultHashPowerPerNftInTh !== S.NOT_EXISTS;
    }

    hasImages(): boolean {
        return this.profileImgUrl !== '' && this.coverImgUrl !== '';
    }

    hasHashPowerInTh(): boolean {
        return this.hashPowerInTh !== S.NOT_EXISTS;
    }

    isStatusApproved(): boolean {
        return this.status === CollectionStatus.APPROVED;
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
        return formatTHs(this.hashPowerInTh !== S.NOT_EXISTS ? this.hashPowerInTh : 0, true);
    }

    formatStatusName(): string {
        return CollectionEntity.formatStatusName(this.status);
    }

    formatRoyaltiesInPercentage(): string {
        return formatPercent(this.royalties !== S.NOT_EXISTS ? this.royalties : 0, true);
    }

    formatDefaultPricePerNftInUsd(): string {
        return formatUsd(this.defaultPricePerNftInUsd !== null ? this.defaultPricePerNftInUsd : 0);
    }

    formatDefaultHashPowerPerNftInTh(): string {
        return formatTHs(this.defaultHashPowerPerNftInTh !== S.NOT_EXISTS ? this.defaultHashPowerPerNftInTh : 0, true)
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

    clone(): CollectionEntity {
        const entity = new CollectionEntity();
        Object.assign(entity, this);
        return entity;
    }

    copy(source: CollectionEntity) {
        Object.assign(this, source);
    }

    static toJson(entity: CollectionEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'id': entity.id,
            'farmId': entity.farmId,
            'creatorId': entity.creatorId,
            'name': entity.name,
            'denomId': entity.denomId,
            'description': entity.description,
            'hashingPower': entity.hashPowerInTh,
            'mainImage': entity.profileImgUrl,
            'bannerImage': entity.coverImgUrl,
            'status': entity.status,
            'royalties': entity.royalties,
            'defaultArtistName': entity.defaultArtistName,
            'defaultPricePerNftInUsd': entity.defaultPricePerNftInUsd?.toString(10) ?? null,
            'defaultHashPowerPerNftInTh': entity.defaultHashPowerPerNftInTh,
            'timestampDeletedAt': entity.timestampDeletedAt,
            'timestampUpdatedAt': entity.timestampUpdatedAt,
        }
    }

    static fromJson(json): CollectionEntity {
        if (json === null) {
            return null;
        }

        const model = new CollectionEntity();

        model.id = json.id ?? model.id;
        model.farmId = json.farmId ?? model.farmId;
        model.creatorId = json.creatorId ?? model.creatorId;
        model.name = json.name ?? model.name;
        model.denomId = json.denomId ?? model.denomId;
        model.description = json.description ?? model.description;
        model.hashPowerInTh = Number(json.hashingPower ?? model.hashPowerInTh);
        model.profileImgUrl = json.mainImage ?? model.profileImgUrl;
        model.coverImgUrl = json.bannerImage ?? model.coverImgUrl;
        model.status = json.status ?? model.status;
        model.royalties = Number(json.royalties ?? model.royalties);
        model.defaultArtistName = json.defaultArtistName ?? model.defaultArtistName;
        model.defaultPricePerNftInUsd = Number(json.defaultPricePerNftInUsd ?? model.defaultPricePerNftInUsd);
        model.defaultHashPowerPerNftInTh = Number(json.defaultHashPowerPerNftInTh ?? model.defaultHashPowerPerNftInTh);
        model.timestampDeletedAt = Number(json.timestampDeletedAt ?? model.timestampDeletedAt);
        model.timestampUpdatedAt = Number(json.timestampUpdatedAt ?? model.timestampUpdatedAt);

        return model;
    }
}
