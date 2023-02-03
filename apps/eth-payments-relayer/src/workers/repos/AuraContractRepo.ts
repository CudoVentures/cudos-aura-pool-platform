import PaymentEventEntity, { PaymentStatus } from '../../entities/PaymentEventEntity';

export default interface AuraContractRepo {
    fetchEvents(lastCheckedBlockHeight: number, currentBlockheight: number): Promise < PaymentEventEntity[] >
    fetchCurrentBlockHeight(): Promise < number >;
    markPaymentWithdrawable(paymentId: number): Promise < string >;
    fetchPaymentStatus(paymentId: number): Promise < PaymentStatus >;
}
