import BigNumber from 'bignumber.js';
import Ledger from 'cudosjs/build/ledgers/Ledger';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';

export enum BuyingCurrency {
    ETH,
    CUDOS
}

export default interface NftRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    fetchNftById(nftId: string, status?: CollectionStatus): Promise < NftEntity >;
    fetchNftByIds(nftIds: string[], status?: CollectionStatus): Promise < NftEntity[] >;
    fetchNewNftDrops(status?: CollectionStatus): Promise < NftEntity[] >;
    fetchTrendingNfts(status?: CollectionStatus): Promise < NftEntity[] >;
    fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } >;

<<<<<<< HEAD
    buyNft(currency: BuyingCurrency, nftEntity: NftEntity, ledger: Ledger): Promise < string >;
    buyPresaleNft(currency: BuyingCurrency, amount: BigNumber, ledger: Ledger): Promise < string >;
=======
    buyNft(nftEntity: NftEntity, ledger: Ledger): Promise < string >;
    buyPresaleNft(currency: BuyingCurrency, ledger: Ledger): Promise < string >;
>>>>>>> ad51264a3c643069e66a4e3a6602e2f93cfa294c
    listNftForSale(nftEntity: NftEntity, collectionEntity: CollectionEntity, price: BigNumber, ledger: Ledger): Promise < string >;
}
