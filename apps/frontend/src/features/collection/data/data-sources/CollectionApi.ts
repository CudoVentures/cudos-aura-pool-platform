import axios from 'axios';
import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';

export default class CollectionApi {

    async fetchCategories(): Promise < CategoryEntity [] > {
        return null;
    }

    // Maybe we will merge this method with fetchCollectionsByFilter
    async fetchTopCollections(period: number): Promise < CollectionEntity[] > {
        return null;
    }

    async fetchCollectionsByIds(idArray: string[]): Promise < CollectionEntity[] > {
        const { data } = await axios.get('/api/v1/collection', { params: {
            id: idArray.join(','),
        } })

        return data
    }

    async fetchCollectionsByFilter(collectionFilterModel: CollectionFilterModel): Promise < { collectionEntities: CollectionEntity[], total: number } > {
        const { data } = await axios.get('/api/v1/collection', { params: {
            ...collectionFilterModel,
        } })

        return data
    }

    async creditCollection(collectionEntity: CollectionEntity, nftEntities: NftEntity[]): Promise < { collectionEntity: CollectionEntity, nftEntities: NftEntity[] } > {
        const { data: collectionData } = await axios.post(
            '/api/v1/collection',
            {
                ...collectionEntity,
                name: collectionEntity.name,
                description: collectionEntity.description,
                denom_id: collectionEntity.name,
                hashing_power: collectionEntity.hashPower,
                royalties: 2,
                maintenance_fee: collectionEntity,
                payout_address: collectionEntity.ownerAddress,
                farm_id: collectionEntity.farmId,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            },
        )

        const { data: nftData } = await axios.post(
            '/api/v1/nft',
            nftEntities.map((nft) => ({
                ...nft,
                name: nft.name,
                uri: nft.imageUrl,
                hashing_power: nft.hashPower,
                price: nft.price,
                expiration_date: nft.expiryDate,
                collection_id: nft.collectionId,
            })),
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            },
        )

        return {
            collectionEntity: collectionData,
            nftEntities: nftData,
        }
    }
}
