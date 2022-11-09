import axios from 'axios';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';

export default class NftApi {

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        const { data } = await axios.get('/api/v1/nft', { params: {
            ...(nftFilterModel.nftIds && { ids: nftFilterModel.nftIds.join(',') }),
            ...(nftFilterModel.collectionIds && { collection_ids: nftFilterModel.collectionIds.join(',') }),
        } })

        const nfts = data.map((nft) => NftEntity.fromJson({
            id: nft.id,
            name: nft.name,
            collectionId: nft.collection_id,
            hashPowerInEH: nft.hashing_power,
            priceInAcudos: nft.price,
            imageUrl: nft.uri,
            expiryDate: new Date(nft.expiration_date).getTime(),
        }))

        return {
            nftEntities: nfts,
            total: nfts.length,
        }
    }

}
