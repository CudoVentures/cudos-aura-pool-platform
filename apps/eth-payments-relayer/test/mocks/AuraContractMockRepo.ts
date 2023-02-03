import BigNumber from 'bignumber.js';
import PaymentEventEntity, { PaymentStatus } from '../../src/entities/PaymentEventEntity';
import AuraContractRepo from '../../src/workers/repos/AuraContractRepo';

const paymentEvents = [
    createPaymentEventEntity(1, 'id1', 'address1', '0.0001', '0xaddress1'),
    createPaymentEventEntity(2, 'id2', 'address2', '0.0001', '0xaddress2'),
    createPaymentEventEntity(3, 'id3', 'address3', '0.0001', '0xaddress3'),
    createPaymentEventEntity(4, 'id4', 'address4', '0.0001', '0xaddress4'),
    createPaymentEventEntity(5, 'id5', 'address5', '0.0001', '0xaddress5'),
    createPaymentEventEntity(6, 'id6', 'address6', '0.0001', '0xaddress6'),
]

function createPaymentEventEntity(paymentId: number, nftId: string, cudosAddress: string, amount: string, ethAddress: string): PaymentEventEntity {
    const entity = new PaymentEventEntity();

    entity.id = paymentId;
    entity.nftId = nftId;
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
