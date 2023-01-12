import NftEntity from '../../../nft/entities/NftEntity';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';

export class ReqFetchCollectionsByFilter {
    collectionFilter: any;

    constructor(collectionFilterModel: CollectionFilterModel) {
        this.collectionFilter = CollectionFilterModel.toJson(collectionFilterModel);
    }
}

export class ReqFetchTopCollections {
    timestampFrom: number;
    timestampTo: number;

    constructor(timestampFrom: number, timestampTo: number) {
        this.timestampFrom = timestampFrom;
        this.timestampTo = timestampTo;
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
