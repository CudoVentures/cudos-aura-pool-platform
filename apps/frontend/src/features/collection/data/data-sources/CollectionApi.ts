import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';
import axios from '../../../../core/utilities/AxiosWrapper';
import Ledger from 'cudosjs/build/ledgers/Ledger';

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
        const { data: collectionJson } = await axios.put(
            '/api/v1/collection',
            {
                ...CollectionEntity.toJson(collectionEntity),
                nfts: nftEntities.map((nft) => NftEntity.toJson(nft)),
            },
        )

        return {
            collectionEntity: CollectionEntity.fromJson(collectionJson),
            nftEntities: collectionJson.nfts.map((nftJson) => NftEntity.fromJson(nftJson)),
        }
    }

    // mint transaction to the chain
    async approveCollection(collectionEntity: CollectionEntity, ledger: Ledger, network: string): Promise < string > {
        // const { data } = await axios.patch(`/api/v1/collection/${collectionEntity.id}/status`, { status: 'approved' });

    }

    async fetchCollectionsDetailsByIds(collectionIds: string[]): Promise < CollectionDetailsEntity[] > {
        return collectionIds.map((id) => CollectionDetailsEntity.fromJson({ id }));
    }
}
