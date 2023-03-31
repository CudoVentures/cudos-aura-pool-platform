import BigNumber from 'bignumber.js';
import { Ledger } from 'cudosjs';
import PurchaseTransactionEntity from '../../entities/PurchaseTransactionEntity';
import PurchaseTransactionsFilterModel from '../../entities/PurchaseTransactionsFilterModel';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import AddressMintDataEntity from '../../../nft-presale/entities/AddressMintDataEntity';
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
    fetchPresaleAmounts(nftFilterModel: NftFilterModel): Promise < { totalPresaleNftCount: number, presaleMintedNftCount } >;
    buyNft(nftEntity: NftEntity, ledger: Ledger): Promise < string >;
    buyPresaleNft(currency: BuyingCurrency, amount: BigNumber, ledger: Ledger): Promise < string >;
    listNftForSale(nftEntity: NftEntity, collectionEntity: CollectionEntity, price: BigNumber, ledger: Ledger): Promise < string >;
    mintPresaleNfts(collectionEntity: CollectionEntity, addressMintDataEntities: AddressMintDataEntity[], ledger: Ledger, cudosPriceInUsd: number): Promise < string >;
    fetchPurchaseTransactions(purchaseTransactionsFilterModel: PurchaseTransactionsFilterModel): Promise < { purchaseTransactionEntities: PurchaseTransactionEntity[], total: number } >;
    clearPurchaseTransactionsSessionStorage(): void;
}
