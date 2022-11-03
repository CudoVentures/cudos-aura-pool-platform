import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';

export default class CollectionApi {

    async fetchCategories(): Promise < CategoryEntity [] > {
        return null;
    }

    async fetchCollectionsByFilter(collectionFilterModel: CollectionFilterModel): Promise < { collectionEntities: CollectionEntity[], total: number } > {
        return null;
    }

    async creditCollection(collectionEntity: CollectionEntity, nftEntities: NftEntity[]): Promise < { collectionEntity: CollectionEntity, nftEntities: NftEntity[] } > {
        return null;
    }
}
