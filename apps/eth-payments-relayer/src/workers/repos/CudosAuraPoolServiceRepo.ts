import PurchaseTransactionEntity from '../../entities/PurchaseTransactionEntity';

export default interface CudosAuraPoolServiceRepo {

    fetchHeartbeat(): Promise< void >;
    fetchLastCheckedEthereumBlock(): Promise < number >;
    updateLastCheckedEthereumBlock(height: number): Promise < void >;
    updateLastCheckedCudosRefundBlock(height: number): Promise < void >;
    fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number >;
    creditPurchaseTransactions(purchaseTransactionEntities: PurchaseTransactionEntity[]): Promise < void >;

}
