import CollectionProfile from '../../../marketplace-collections/entities/CollectionProfile';
import MiningFarmModel from '../../../mining-farm/entities/MiningFarmModel';
import NftPreviewModel from '../../entities/NftPreviewModel';
import NftProfile from '../../entities/NftProfile';

export default interface NftRepo {

    getNftsByCategoryAndSearchSortedPaginated(
        collectionId: string,
        search: string,
        category: string,
        sortKey: string,
        start: number,
        size: number,
        callback: (nftPreviews: NftPreviewModel[], total: number) => void,
    );

    getNftProfile(
        nftId: string,
        callback: (nftProfile: NftProfile, collectionProfile: CollectionProfile, farmView: MiningFarmModel) => void);
}