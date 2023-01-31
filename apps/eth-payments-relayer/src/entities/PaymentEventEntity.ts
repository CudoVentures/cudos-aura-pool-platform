import BigNumber from 'bignumber.js';
import ethers from 'ethers';

type ContractEvent = {
    amount: string,
    cudosAddress: string,
    id: string,
    payee: string,
    status: string
}

export enum PaymentStatus {
    LOCKED = '0',
    WITHDRAWABLE = '1',
    RETURNED = '2',
    FINISHED = '3',
    WITHDRAWN = '4'
}

function parsePaymentStatus(status: string): PaymentStatus {
    switch (status) {
        case '0':
            return PaymentStatus.LOCKED;
        case '1':
            return PaymentStatus.WITHDRAWABLE;
        case '2':
            return PaymentStatus.RETURNED;
        case '3':
            return PaymentStatus.FINISHED;
        case '4':
            return PaymentStatus.WITHDRAWN;
        default:
            return null;
    }
}

export default class PaymentEventEntity {
    nftId: string;
    cudosAddress: string;
    amount: BigNumber;
    payee: string;
    status: PaymentStatus;

    constructor() {
        this.nftId = '';
        this.cudosAddress = '';
        this.amount = null;
        this.payee = '';
        this.status = null;
    }

    static fromContractEvent(event: ContractEvent): PaymentEventEntity {
        const entity = new PaymentEventEntity();

        entity.nftId = event.id ? ethers.utils.toUtf8String(event.id) : entity.nftId;
        entity.cudosAddress = event.cudosAddress ? ethers.utils.toUtf8String(event.cudosAddress) : entity.cudosAddress;
        entity.amount = event.amount ? new BigNumber(event.amount) : entity.amount;
        entity.payee = event.payee ? ethers.utils.toUtf8String(event.payee) : entity.payee;
        entity.status = parsePaymentStatus(event.status) ?? entity.status;

        return entity;
    }
}
