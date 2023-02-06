import AddressbookEntryEntity from '../../entities/AddressbookEntryEntity';
import NftEntity from '../../entities/NftEntity';
import PaymentEventEntity from '../../entities/PaymentEventEntity';
import PaymentTransactionEntity from '../../entities/PaymentTransactionEntity';
import RefundTransactionEntity from '../../entities/RefundTransactionEntity';

export default interface CudosChainRepo {
    fetchCurrentBlockHeight(): Promise < number >;
    fetchAddressbookEntry(cudosAddress: string): Promise < AddressbookEntryEntity >;
    fetchRefundTransactions(fromHeight: number, toHeight: number): Promise < RefundTransactionEntity[] >;
    fetchPaymentTransactionByTxhash(txHash: string): Promise < PaymentTransactionEntity >;
    sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity, nftEntity: NftEntity): Promise < string >;
}
