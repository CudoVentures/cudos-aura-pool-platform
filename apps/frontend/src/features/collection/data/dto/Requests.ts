import NftEntity from '../../../nft/entities/NftEntity';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';

export class ReqFetchCollectionsByFilter {
    collectionFilter: CollectionFilterModel;

    constructor(collectionFilterModel: CollectionFilterModel) {
        this.collectionFilter = collectionFilterModel;
    }
}

export class ReqCreditCollection {
    collectionDto: CollectionEntity;
    nftDtos: NftEntity[];

    constructor(collectionEntity: CollectionEntity, nftEntities: NftEntity[]) {
        this.collectionDto = CollectionEntity.toJson(collectionEntity);
        this.nftDtos = nftEntities.map((entity) => NftEntity.toJson(entity));
    }
}

export class ReqEditCollection {
    collectionDto: CollectionEntity;

    constructor(collectionEntity: CollectionEntity) {
        this.collectionDto = CollectionEntity.toJson(collectionEntity);
    }
}

export class ReqFetchCollectionDetails {
    collectionIds: string[];

    constructor(collectionIds: string[]) {
        this.collectionIds = collectionIds;
    }
}
