import { NOT_EXISTS_INT } from '../../common/utils';
import { NftJsonValidator, NftStatus } from '../nft.types';
import { NftRepo } from '../repos/nft.repo';

export default class NftEntity {
    id: number;
    name: string;
    uri: string;
    data: string;
    tokenId: string;
    hashingPower: number;
    price: string;
    expirationDateTimestamp: number;
    collectionId: number;
    marketplaceNftId: number;
    status: NftStatus;
    currentOwner: string;
    creatorId: number;

    constructor() {
        this.id = NOT_EXISTS_INT;
        this.name = '';
        this.uri = '';
        this.data = '';
        this.tokenId = '';
        this.hashingPower = NOT_EXISTS_INT;
        this.price = '';
        this.expirationDateTimestamp = NOT_EXISTS_INT;
        this.collectionId = NOT_EXISTS_INT;
        this.marketplaceNftId = NOT_EXISTS_INT;
        this.status = NftStatus.QUEUED;
        this.currentOwner = '';
        this.creatorId = NOT_EXISTS_INT;
    }

    isNew(): boolean {
        return this.id === NOT_EXISTS_INT;
    }

    isMinted(): boolean {
        return this.tokenId !== ''
    }

    static fromJson(json: NftJsonValidator): NftEntity {
        const entity = new NftEntity();

        entity.id = parseInt(json.id ?? json.id.toString());
        entity.name = json.name ?? entity.name;
        entity.uri = json.uri ?? entity.uri;
        entity.data = json.data ?? entity.data;
        entity.hashingPower = json.hashingPower ?? entity.hashingPower;
        entity.price = json.price ?? entity.price;
        entity.expirationDateTimestamp = json.expirationDateTimestamp ?? entity.expirationDateTimestamp;
        entity.collectionId = parseInt(json.collectionId ?? entity.collectionId.toString());
        entity.marketplaceNftId = parseInt(json.marketplaceNftId ?? entity.marketplaceNftId.toString());
        entity.status = json.status ?? entity.status;
        entity.currentOwner = json.currentOwner ?? entity.currentOwner;
        entity.creatorId = parseInt(json.creatorId ?? entity.creatorId.toString());

        return entity;
    }

    static toJson(entity: NftEntity): NftJsonValidator {
        return {
            'id': entity.id.toString(),
            'name': entity.name,
            'uri': entity.uri,
            'data': entity.data,
            'tokenId': entity.tokenId,
            'hashingPower': entity.hashingPower,
            'price': entity.price,
            'expirationDateTimestamp': entity.expirationDateTimestamp,
            'collectionId': entity.collectionId.toString(),
            'marketplaceNftId': entity.marketplaceNftId.toString(),
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

        entity.id = parseInt(repoJson.id ?? repoJson.id.toString());
        entity.name = repoJson.name ?? entity.name;
        entity.uri = repoJson.uri ?? entity.uri;
        entity.data = repoJson.data ?? entity.data;
        entity.hashingPower = repoJson.hashingPower ?? entity.hashingPower;
        entity.price = repoJson.price ?? entity.price;
        entity.expirationDateTimestamp = repoJson.expirationDate?.getTime() ?? entity.expirationDateTimestamp;
        entity.collectionId = repoJson.collectionId ?? entity.collectionId;
        entity.marketplaceNftId = repoJson.marketplaceNftId ?? entity.marketplaceNftId;
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
            repoJson.id = entity.id.toString();
        }

        repoJson.name = entity.name;
        repoJson.uri = entity.uri;
        repoJson.data = entity.data;
        repoJson.hashingPower = entity.hashingPower;
        repoJson.price = entity.price;
        repoJson.expirationDate = new Date(entity.expirationDateTimestamp);
        repoJson.collectionId = entity.collectionId;
        repoJson.marketplaceNftId = entity.marketplaceNftId;
        repoJson.status = entity.status;
        repoJson.currentOwner = entity.currentOwner;
        repoJson.creatorId = entity.creatorId;

        return repoJson;
    }
}
