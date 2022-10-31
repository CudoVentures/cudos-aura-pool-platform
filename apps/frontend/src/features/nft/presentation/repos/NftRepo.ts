import { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';

export default interface NftRepo {

    fetchNftById(nftId: string, status?: CollectionStatus): Promise < NftEntity >;

    fetchNewNftDrops(status?: CollectionStatus): Promise < NftEntity[] >;

    fetchTrendingNfts(status?: CollectionStatus): Promise < NftEntity[] >;

    fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } >;
}
