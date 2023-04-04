import BigNumber from 'bignumber.js';
import { CURRENCY_DECIMALS } from 'cudosjs';
import { NOT_EXISTS_INT } from '../../common/utils';
import { NftGroup, NftJsonValidator, NftStatus } from '../nft.types';
import { NftRepo } from '../repos/nft.repo';

export default class NftEntity {
    id: string;
    name: string;
    uri: string;
    group: NftGroup;
    tokenId: string;
    hashingPower: number;
    acudosPrice: BigNumber;
    expirationDateTimestamp: number;
    collectionId: number;
    marketplaceNftId: string;
    status: NftStatus;
    currentOwner: string;
    creatorId: number;
    priceUsd: number;
    priceAcudosValidUntil: number;
    updatedAt: number;
    deletedAt: number;
    createdAt: number;
    artistName: string;

    constructor() {
        this.id = '';
        this.name = '';
        this.uri = '';
        this.group = NftGroup.PUBLIC_SALE;
        this.tokenId = '';
        this.hashingPower = NOT_EXISTS_INT;
        this.acudosPrice = new BigNumber(NOT_EXISTS_INT);
        this.expirationDateTimestamp = NOT_EXISTS_INT;
        this.collectionId = NOT_EXISTS_INT;
        this.marketplaceNftId = '';
        this.status = NftStatus.QUEUED;
        this.currentOwner = '';
        this.creatorId = NOT_EXISTS_INT;
        this.priceUsd = NOT_EXISTS_INT;
        this.priceAcudosValidUntil = NOT_EXISTS_INT;
        this.updatedAt = NOT_EXISTS_INT;
        this.deletedAt = NOT_EXISTS_INT;
        this.createdAt = NOT_EXISTS_INT;
        this.artistName = '';
    }

    isListed(): boolean {
        if (this.isMinted() === true && this.hasPrice() === true) {
            return true;
        }

        if (this.isMinted() === false && this.priceUsd !== NOT_EXISTS_INT) {
            return true;
        }

        return false;
        // return this.isMinted() === true && this.hasPrice() === true;
    }

    hasPrice(): boolean {
        return this.acudosPrice.gt(0);
    }

    hasOwner(): boolean {
        return this.currentOwner !== '';
    }

    isNew(): boolean {
        const idAsNumber = parseInt(this.id);
        return Number.isNaN(idAsNumber) === false && idAsNumber < 0;
    }

    isMinted(): boolean {
        return this.status === NftStatus.MINTED && this.tokenId !== '';
    }

    isPriceInAcudosValidForMinting(): boolean {
        return Date.now() < this.priceAcudosValidUntil;
    }

    isQueued(): boolean {
        return this.status === NftStatus.QUEUED;
    }

    isSold(): boolean {
        return this.tokenId !== '';
    }

    getTokenIdAsInt(): number {
        const tokenIdAsInt = parseInt(this.tokenId);
        return Number.isNaN(tokenIdAsInt) === true ? NOT_EXISTS_INT : tokenIdAsInt;
    }

    getPriceInCudos(): BigNumber {
        return this.acudosPrice.shiftedBy(-CURRENCY_DECIMALS);
    }

    markAsQueued() {
        this.status = NftStatus.QUEUED;
    }

    static fromJson(json: NftJsonValidator): NftEntity {
        const entity = new NftEntity();

        entity.id = json.id ?? json.id;
        entity.name = json.name ?? entity.name;
        entity.uri = json.uri ?? entity.uri;
        entity.group = json.group ?? entity.group;
        entity.tokenId = json.tokenId ?? entity.tokenId;
        entity.hashingPower = json.hashingPower ?? entity.hashingPower;
        entity.acudosPrice = new BigNumber(json.priceInAcudos ?? entity.acudosPrice);
        entity.expirationDateTimestamp = json.expirationDateTimestamp ?? entity.expirationDateTimestamp;
        entity.collectionId = parseInt(json.collectionId ?? entity.collectionId.toString());
        entity.marketplaceNftId = json.marketplaceNftId ?? entity.marketplaceNftId;
        entity.status = json.status ?? entity.status;
        entity.currentOwner = json.currentOwner ?? entity.currentOwner;
        entity.creatorId = parseInt(json.creatorId ?? entity.creatorId.toString());
        entity.priceUsd = json.priceUsd ?? entity.priceUsd;
        entity.priceAcudosValidUntil = json.priceAcudosValidUntil ?? entity.priceAcudosValidUntil;
        entity.updatedAt = json.updatedAt ?? entity.updatedAt;
        entity.deletedAt = json.deletedAt ?? entity.deletedAt;
        entity.createdAt = json.createdAt ?? entity.createdAt;
        entity.artistName = json.artistName ?? entity.artistName;

        return entity;
    }

    static toJson(entity: NftEntity): NftJsonValidator {
        return {
            'id': entity.id,
            'name': entity.name,
            'uri': entity.uri,
            'group': entity.group,
            'tokenId': entity.tokenId,
            'hashingPower': entity.hashingPower,
            'priceInAcudos': entity.acudosPrice.toString(10),
            'expirationDateTimestamp': entity.expirationDateTimestamp,
            'collectionId': entity.collectionId.toString(),
            'marketplaceNftId': entity.marketplaceNftId,
            'status': entity.status,
            'currentOwner': entity.currentOwner,
            'creatorId': entity.creatorId.toString(),
            'priceUsd': entity.priceUsd,
            'priceAcudosValidUntil': entity.priceAcudosValidUntil,
            'updatedAt': entity.updatedAt,
            'deletedAt': entity.deletedAt,
            'createdAt': entity.createdAt,
            'artistName': entity.artistName,
        }
    }

    static fromRepo(repoJson: NftRepo): NftEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new NftEntity();

        entity.id = repoJson.id ?? repoJson.id;
        entity.name = repoJson.name ?? entity.name;
        entity.uri = repoJson.uri ?? entity.uri;
        entity.tokenId = repoJson.tokenId ?? entity.tokenId;
        entity.group = repoJson.group ?? entity.group;
        entity.hashingPower = Number(repoJson.hashingPower ?? entity.hashingPower);
        entity.acudosPrice = new BigNumber(repoJson.price ?? entity.acudosPrice);
        entity.expirationDateTimestamp = repoJson.expirationDate?.getTime() ?? entity.expirationDateTimestamp;
        entity.collectionId = repoJson.collectionId ?? entity.collectionId;
        entity.marketplaceNftId = repoJson.marketplaceNftId?.toString() ?? entity.marketplaceNftId;
        entity.status = repoJson.status ?? entity.status;
        entity.currentOwner = repoJson.currentOwner ?? entity.currentOwner;
        entity.creatorId = repoJson.creatorId ?? entity.creatorId;
        entity.priceUsd = Number(repoJson.priceUsd ?? entity.priceUsd.toString());
        entity.priceAcudosValidUntil = parseInt(repoJson.priceAcudosValidUntil ?? entity.priceAcudosValidUntil.toString());
        entity.updatedAt = repoJson.updatedAt?.getTime() ?? entity.updatedAt;
        entity.deletedAt = repoJson.deletedAt?.getTime() ?? entity.deletedAt;
        entity.createdAt = repoJson.createdAt?.getTime() ?? entity.createdAt;
        entity.artistName = repoJson.artistName ?? entity.artistName;

        return entity;
    }

    static toRepo(entity: NftEntity): NftRepo {
        if (entity === null) {
            return null;
        }

        const repoJson = new NftRepo();

        if (entity.isNew() === false) {
            repoJson.id = entity.id;
        }

        repoJson.name = entity.name;
        repoJson.uri = entity.uri;
        repoJson.group = entity.group;
        repoJson.tokenId = entity.tokenId;
        repoJson.hashingPower = entity.hashingPower.toString();
        repoJson.price = entity.acudosPrice.toString(10);
        repoJson.expirationDate = new Date(entity.expirationDateTimestamp);
        repoJson.collectionId = entity.collectionId;
        repoJson.marketplaceNftId = entity.marketplaceNftId === '' ? null : parseInt(entity.marketplaceNftId);
        repoJson.status = entity.status;
        repoJson.currentOwner = entity.currentOwner;
        repoJson.creatorId = entity.creatorId;
        repoJson.priceUsd = entity.priceUsd.toString();
        repoJson.priceAcudosValidUntil = entity.priceAcudosValidUntil.toString();
        repoJson.artistName = entity.artistName;
        // repoJson.updatedAt = new Date(entity.updatedAt);
        // repoJson.deletedAt = new Date(entity.deletedAt);
        // repoJson.createdAt = new Date(entity.createdAt);

        return repoJson;
    }
}
