import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';
import axios from '../../../../core/utilities/AxiosWrapper';

export default class CollectionApi {

    async fetchCategories(): Promise < CategoryEntity [] > {
        return null;
    }

    async fetchCollectionsByFilter(collectionFilterModel: CollectionFilterModel): Promise < { collectionEntities: CollectionEntity[], total: number } > {
        const { data } = await axios.get('/api/v1/collection', { params: CollectionFilterModel.toJson(collectionFilterModel) })

        return {
            collectionEntities: data.map((collectionJson) => CollectionEntity.fromJson(collectionJson)),
            total: data.length,
        }
    }

    async creditCollection(collectionEntity: CollectionEntity, nftEntities: NftEntity[]): Promise < { collectionEntity: CollectionEntity, nftEntities: NftEntity[] } > {
        const { data } = await axios.put(
            '/api/v1/collection',
            {
                ...CollectionEntity.toJson(collectionEntity),
                nfts: nftEntities.map((nft) => NftEntity.toJson(nft)),
            },
        )

        return {
            collectionEntity: CollectionEntity.fromJson(data.collection),
            nftEntities: data.nfts.map((nftJson) => NftEntity.fromJson(nftJson)),
        }
    }

    async approveCollection(collectionId: string): Promise < void > {
        const { data } = await axios.patch(`/api/v1/collection/${collectionId}/status`, { status: 'approved' });
    }

    async fetchCollectionsDetailsByIds(collectionIds: string[]): Promise < CollectionDetailsEntity[] > {
        return collectionIds.map((id) => CollectionDetailsEntity.fromJson({ id }));
    }
}
