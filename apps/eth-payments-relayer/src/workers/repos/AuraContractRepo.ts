import PaymentEventEntity, { PaymentStatus } from '../../entities/PaymentEventEntity';

export default interface AuraContractRepo {
    fetchEvents(lastCheckedBlockHeight: number, currentBlockheight: number): Promise < PaymentEventEntity[] >
    fetchCurrentBlockHeight(): Promise < number >;
    markPaymentWithdrawable(nftId: string): Promise < string >;
    fetchPaymentStatus(nftId: string): Promise < PaymentStatus >;
}
