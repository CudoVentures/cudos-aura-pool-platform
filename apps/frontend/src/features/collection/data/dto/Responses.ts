import NftEntity from '../../../nft/entities/NftEntity';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity from '../../entities/CollectionEntity';

export class ResFetchCollectionsByFilter {
    collectionEntities: CollectionEntity[];
    total: number;

    constructor(data) {
        this.collectionEntities = data.collectionEntities.map((collectionJson) => CollectionEntity.fromJson(collectionJson));
        this.total = data.total;
    }
}

export class ResCreditCollection {
    collectionEntity: CollectionEntity;
    nftEntities: NftEntity[];

    constructor(data) {
        this.collectionEntity = CollectionEntity.fromJson(data.collection);
        this.nftEntities = data.nfts.map((nftJson) => NftEntity.fromJson(nftJson));
    }
}

export class ResFetchCollectionDetails {
    detailEntities: CollectionDetailsEntity[]

    constructor(data) {
        if (!data.collectionDetailsEntities) {
            this.detailEntities = [];
            return;
        }

        this.detailEntities = data.collectionDetailsEntities.map((details) => CollectionDetailsEntity.fromJson(details))
    }
}
