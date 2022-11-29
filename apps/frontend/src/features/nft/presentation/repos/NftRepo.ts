import BigNumber from 'bignumber.js';
import Ledger from 'cudosjs/build/ledgers/Ledger';
import { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';

export default interface NftRepo {

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void);

    fetchNftById(nftId: string, status?: CollectionStatus): Promise < NftEntity >;
    fetchNftByIds(nftIds: string[], status?: CollectionStatus): Promise < NftEntity[] >;
    fetchNewNftDrops(status?: CollectionStatus): Promise < NftEntity[] >;
    fetchTrendingNfts(status?: CollectionStatus): Promise < NftEntity[] >;
    fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } >;

    buyNft(nftEntity: NftEntity, ledger: Ledger): Promise < string >;
    listNftForSale(nftEntity: NftEntity, price: BigNumber, ledger: Ledger): Promise < string >;
}
