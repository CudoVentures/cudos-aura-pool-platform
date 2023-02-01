import BigNumber from 'bignumber.js';
import ethers from 'ethers';

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
    id: number;
    nftId: string;
    cudosAddress: string;
    amount: BigNumber;
    payee: string;
    status: PaymentStatus;

    constructor() {
        this.id = null;
        this.nftId = '';
        this.cudosAddress = '';
        this.amount = null;
        this.payee = '';
        this.status = null;
    }

    isValid(): boolean {
        return this.id !== null
            && this.nftId !== ''
            && this.cudosAddress !== ''
            && this.amount !== null
            && this.payee !== ''
            && this.status !== null
    }

    static fromContractEvent(event: any): PaymentEventEntity {
        const entity = new PaymentEventEntity();

        entity.id = event.id ? parseInt(event.id) : entity.id;
        entity.nftId = event.nftId ? ethers.utils.toUtf8String(event.nftId) : entity.nftId;
        entity.cudosAddress = event.cudosAddress ? ethers.utils.toUtf8String(event.cudosAddress) : entity.cudosAddress;
        entity.amount = event.amount ? new BigNumber(event.amount) : entity.amount;
        entity.payee = event.payee ? ethers.utils.toUtf8String(event.payee) : entity.payee;
        entity.status = parsePaymentStatus(event.status) ?? entity.status;

        return entity;
    }
}
