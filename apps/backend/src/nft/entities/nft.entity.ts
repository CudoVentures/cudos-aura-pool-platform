import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../../common/utils';
import { NftJsonValidator, NftStatus } from '../nft.types';
import { NftRepo } from '../repos/nft.repo';

export default class NftEntity {
    id: string;
    name: string;
    uri: string;
    data: string;
    tokenId: string;
    hashingPower: number;
    acudosPrice: BigNumber;
    expirationDateTimestamp: number;
    collectionId: number;
    marketplaceNftId: string;
    status: NftStatus;
    currentOwner: string;
    creatorId: number;

    constructor() {
        this.id = '';
        this.name = '';
        this.uri = '';
        this.data = '';
        this.tokenId = '';
        this.hashingPower = NOT_EXISTS_INT;
        this.acudosPrice = new BigNumber(NOT_EXISTS_INT);
        this.expirationDateTimestamp = NOT_EXISTS_INT;
        this.collectionId = NOT_EXISTS_INT;
        this.marketplaceNftId = '';
        this.status = NftStatus.QUEUED;
        this.currentOwner = '';
        this.creatorId = NOT_EXISTS_INT;
    }

    isListed(): boolean {
        return this.isMinted() === true && this.hasPrice() === true;
    }

    hasPrice(): boolean {
        return this.acudosPrice.gt(0);
    }

    isNew(): boolean {
        const idAsNumber = parseInt(this.id);
        return Number.isNaN(idAsNumber) === false && idAsNumber < 0;
    }

    isMinted(): boolean {
        return this.status === NftStatus.MINTED && this.tokenId !== '';
    }

    getTokenIdAsInt(): number {
        const tokenIdAsInt = parseInt(this.tokenId);
        return Number.isNaN(tokenIdAsInt) === true ? NOT_EXISTS_INT : tokenIdAsInt;
    }

    static fromJson(json: NftJsonValidator): NftEntity {
        const entity = new NftEntity();

        entity.id = json.id ?? json.id;
        entity.name = json.name ?? entity.name;
        entity.uri = json.uri ?? entity.uri;
        entity.data = json.data ?? entity.data;
        entity.tokenId = json.tokenId ?? entity.tokenId;
        entity.hashingPower = json.hashingPower ?? entity.hashingPower;
        entity.acudosPrice = new BigNumber(json.priceInAcudos ?? entity.acudosPrice);
        entity.expirationDateTimestamp = json.expirationDateTimestamp ?? entity.expirationDateTimestamp;
        entity.collectionId = parseInt(json.collectionId ?? entity.collectionId.toString());
        entity.marketplaceNftId = json.marketplaceNftId ?? entity.marketplaceNftId;
        entity.status = json.status ?? entity.status;
        entity.currentOwner = json.currentOwner ?? entity.currentOwner;
        entity.creatorId = parseInt(json.creatorId ?? entity.creatorId.toString());

        return entity;
    }

    static toJson(entity: NftEntity): NftJsonValidator {
        return {
            'id': entity.id,
            'name': entity.name,
            'uri': entity.uri,
            'data': entity.data,
            'tokenId': entity.tokenId,
            'hashingPower': entity.hashingPower,
            'priceInAcudos': entity.acudosPrice.toFixed(0),
            'expirationDateTimestamp': entity.expirationDateTimestamp,
            'collectionId': entity.collectionId.toString(),
            'marketplaceNftId': entity.marketplaceNftId,
            'status': entity.status,
            'currentOwner': entity.currentOwner,
            'creatorId': entity.creatorId.toString(),
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
        entity.data = repoJson.data ?? entity.data;
        entity.hashingPower = Number(repoJson.hashingPower ?? entity.hashingPower);
        entity.acudosPrice = new BigNumber(repoJson.price ?? entity.acudosPrice);
        entity.expirationDateTimestamp = repoJson.expirationDate?.getTime() ?? entity.expirationDateTimestamp;
        entity.collectionId = repoJson.collectionId ?? entity.collectionId;
        entity.marketplaceNftId = repoJson.marketplaceNftId?.toString() ?? entity.marketplaceNftId;
        entity.status = repoJson.status ?? entity.status;
        entity.currentOwner = repoJson.currentOwner ?? entity.currentOwner;
        entity.creatorId = repoJson.creatorId ?? entity.creatorId;

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
        repoJson.data = entity.data;
        repoJson.tokenId = entity.tokenId;
        repoJson.hashingPower = entity.hashingPower.toString();
        repoJson.price = entity.acudosPrice.toString();
        repoJson.expirationDate = new Date(entity.expirationDateTimestamp);
        repoJson.collectionId = entity.collectionId;
        repoJson.marketplaceNftId = entity.marketplaceNftId === '' ? NOT_EXISTS_INT : parseInt(entity.marketplaceNftId);
        repoJson.status = entity.status;
        repoJson.currentOwner = entity.currentOwner;
        repoJson.creatorId = entity.creatorId;

        return repoJson;
    }
}
