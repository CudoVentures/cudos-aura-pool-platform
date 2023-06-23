import PurchaseTransactionEntity from '../../entities/PurchaseTransactionEntity';

export default interface CudosAuraPoolServiceRepo {

    fetchHeartbeat(): Promise< void >;
    fetchLastCheckedBlock(): Promise < number >;
    updateLastCheckedHeight(height: number): Promise < void >;
    triggerUpdateMarketplaceModuleCollections(denomIds: string[], collectionIds: string[], height: number): Promise < void >;
    triggerUpdateMarketplaceModuleNfts(nftDtos: {tokenId: string, denomId: string}[], height: number): Promise < void >;
    triggerUpdateNftModuleCollections(denomIds: string[], height: number): Promise < void >;

    creditPurchaseTransactions(purchaseTransactionEntities: PurchaseTransactionEntity[]): Promise < void >;
}
