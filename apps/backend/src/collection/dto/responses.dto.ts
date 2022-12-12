import NftEntity from '../../nft/entities/nft.entity';
import { NftJsonValidator } from '../../nft/nft.types';
import { CollectionJsonValidator } from '../collection.types';
import { CollectionDetailsEntity } from '../entities/collection-details.entity';
import { CollectionEntity } from '../entities/collection.entity';

export class ResCreditCollection {
    collection: CollectionJsonValidator;
    nfts: NftJsonValidator[];
    deletedNfts: number;

    constructor(collection: CollectionEntity, nfts: NftEntity[], deletedNfts: number) {
        this.collection = CollectionEntity.toJson(collection);
        this.nfts = nfts.map((nftEntity) => NftEntity.toJson(nftEntity));
        this.deletedNfts = deletedNfts;
    }
}

export class ResEditCollection {
    collection: CollectionJsonValidator;

    constructor(collection: CollectionEntity) {
        this.collection = CollectionEntity.toJson(collection);
    }
}

export class ResFetchCollectionsByFilter {
    collectionEntities: CollectionJsonValidator[];
    total: number;

    constructor(collectionEntities: CollectionEntity[], total: number) {
        this.collectionEntities = collectionEntities.map((collectionEntity) => CollectionEntity.toJson(collectionEntity));
        this.total = total;
    }
}

export class ResFetchCollectionDetails {
    collectionDetailsEntities: any[];

    constructor(collectionDetailsEntities: CollectionDetailsEntity[]) {
        this.collectionDetailsEntities = collectionDetailsEntities.map((entity) => CollectionDetailsEntity.toJson(entity));
    }
}
