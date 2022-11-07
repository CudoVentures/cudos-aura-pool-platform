import axios from 'axios';
import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';

const MiningFarmStatusMap = {
    queued: CollectionStatus.QUEUED,
    approved: CollectionStatus.APPROVED,
    deleted: CollectionStatus.DELETED,
    rejected: CollectionStatus.REJECTED,
    issued: CollectionStatus.ISSUED,
}

export default class CollectionApi {

    async fetchCategories(): Promise < CategoryEntity [] > {
        return null;
    }

    async fetchCollectionsByFilter(collectionFilterModel: CollectionFilterModel): Promise < { collectionEntities: CollectionEntity[], total: number } > {
        const { data } = await axios.get('/api/v1/collection', { params: {
            ...collectionFilterModel,
        } })

        return {
            collectionEntities: data.map((collection) => CollectionEntity.fromJson({
                id: collection.id,
                farmId: collection.farm_id,
                name: collection.name,
                description: collection.description,
                hashPower: collection.hashing_power,
                status: MiningFarmStatusMap[collection.status],
                royalties: collection.royalties,
                maintenanceFees: collection.maintenance_fee,
            })),
            total: data.length,
        }
    }

    async creditCollection(collectionEntity: CollectionEntity, nftEntities: NtEntity[]): Promise < { collectionEntity: CollectionEntity, nftEntities: NftEntity[] } > {
        const { data: collectionData } = await axios.put(
            '/api/v1/collection',
            {
                ...collectionEntity,
                name: collectionEntity.name,
                description: collectionEntity.description,
                denom_id: collectionEntity.name,
                hashing_power: collectionEntity.hashPower,
                royalties: collectionEntity.royalties,
                maintenance_fee: Number(collectionEntity.maintenanceFees),
                payout_address: collectionEntity.payoutAddress,
                farm_id: collectionEntity.farmId,
                nfts: nftEntities.map((nft) => ({
                    id: nft.id,
                    name: nft.name,
                    ...(nft.imageUrl && { uri: nft.imageUrl }),
                    hashing_power: nft.hashPower,
                    price: Number(nft.price),
                    expiration_date: new Date(nft.expiryDate),
                    collection_id: nft.collectionId,
                })),
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            },
        )

        return {
            collectionEntity: collectionData,
            nftEntities: collectionData.nfts,
        }
    }

    async approveCollection(collectionId: number): Promise < void > {
        const { data } = await axios.patch(`/api/v1/collection/${collectionId}/status`, { status: 'approved' }, { headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        } })
    }
}
