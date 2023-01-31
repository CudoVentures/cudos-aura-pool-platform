import PaymentEventEntity from '../../entities/PaymentEventEntity';

export default interface AuraContractRepo {
    fetchEventsAfterBlock(blockHeight: number): Promise < PaymentEventEntity[] >
    fetchCurrentBlockHeight(): Promise < number >;
    markPaymentWithdrawable(nftId: string): Promise < string >;
}
