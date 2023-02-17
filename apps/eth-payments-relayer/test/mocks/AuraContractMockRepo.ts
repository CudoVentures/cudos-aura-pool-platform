import BigNumber from 'bignumber.js';
import PaymentEventEntity, { PaymentStatus } from '../../src/entities/PaymentEventEntity';
import AuraContractRepo from '../../src/workers/repos/AuraContractRepo';

const paymentEvents = [
    createPaymentEventEntity(1, 'address1', '1', '0xaddress1'),
    createPaymentEventEntity(2, 'address2', '1', '0xaddress2'),
    createPaymentEventEntity(3, 'address3', '1', '0xaddress3'),
    createPaymentEventEntity(4, 'address4', '1', '0xaddress4'),
    createPaymentEventEntity(5, 'address5', '1', '0xaddress5'),
    createPaymentEventEntity(6, 'address6', '1', '0xaddress6'),
]

function createPaymentEventEntity(paymentId: number, cudosAddress: string, amount: string, ethAddress: string): PaymentEventEntity {
    const entity = new PaymentEventEntity();

    entity.id = paymentId;
    entity.cudosAddress = cudosAddress;
    entity.amount = new BigNumber(amount);
    entity.payee = ethAddress;

    return entity;
}

export class AuraContractHappyPathMockRepo implements AuraContractRepo {
    async fetchEvents(lastCheckedBlockHeight: number, currentBlockheight: number): Promise<PaymentEventEntity[]> {
        return paymentEvents
    }

    async fetchCurrentBlockHeight(): Promise<number> {
        return 3
    }

    async markPaymentWithdrawable(paymentId: number): Promise<string> {
        return 'txhash';
    }

    async fetchPaymentStatus(paymentId: number): Promise<PaymentStatus> {
        return PaymentStatus.LOCKED;
    }

}

export class AuraContractHappyPathNoPaymentsMockRepo implements AuraContractRepo {
    async fetchEvents(lastCheckedBlockHeight: number, currentBlockheight: number): Promise<PaymentEventEntity[]> {
        return []
    }

    async fetchCurrentBlockHeight(): Promise<number> {
        return 3
    }

    async markPaymentWithdrawable(paymentId: number): Promise<string> {
        return 'txhash';
    }

    async fetchPaymentStatus(paymentId: number): Promise<PaymentStatus> {
        return PaymentStatus.LOCKED;
    }
}

export class AuraContractPaymentReturnedMockRepo implements AuraContractRepo {
    async fetchEvents(lastCheckedBlockHeight: number, currentBlockheight: number): Promise<PaymentEventEntity[]> {
        return []
    }

    async fetchCurrentBlockHeight(): Promise<number> {
        return 3;
    }

    async markPaymentWithdrawable(paymentId: number): Promise<string> {
        return 'txhash';
    }

    async fetchPaymentStatus(paymentId: number): Promise<PaymentStatus> {
        return PaymentStatus.WITHDRAWABLE;
    }
}

export class AuraContractLowBlockHeightMockRepo implements AuraContractRepo {
    async fetchEvents(lastCheckedBlockHeight: number, currentBlockheight: number): Promise<PaymentEventEntity[]> {
        return []
    }

    async fetchCurrentBlockHeight(): Promise<number> {
        return 1;
    }

    async markPaymentWithdrawable(paymentId: number): Promise<string> {
        return 'txhash';
    }

    async fetchPaymentStatus(paymentId: number): Promise<PaymentStatus> {
        return PaymentStatus.WITHDRAWABLE;
    }
}

export class AuraContractWrongAmountMockRepo implements AuraContractRepo {
    async fetchEvents(lastCheckedBlockHeight: number, currentBlockheight: number): Promise<PaymentEventEntity[]> {
        const payments = paymentEvents.map((entity) => {
            const editedPayment = Object.assign(new PaymentEventEntity(), entity)
            editedPayment.amount = new BigNumber(123);
            return editedPayment
        });

        return payments
    }

    async fetchCurrentBlockHeight(): Promise<number> {
        return 3
    }

    async markPaymentWithdrawable(paymentId: number): Promise<string> {
        return 'txhash';
    }

    async fetchPaymentStatus(paymentId: number): Promise<PaymentStatus> {
        return PaymentStatus.LOCKED;
    }
}
