import BigNumber from 'bignumber.js';
import { utils } from 'ethers';

export enum PaymentStatus {
    LOCKED = 0,
    WITHDRAWABLE = 1,
    RETURNED = 2,
    FINISHED = 3,
    WITHDRAWN = 4
}

export function parsePaymentStatus(status: number): PaymentStatus {
    switch (status) {
        case 0:
            return PaymentStatus.LOCKED;
        case 1:
            return PaymentStatus.WITHDRAWABLE;
        case 2:
            return PaymentStatus.RETURNED;
        case 3:
            return PaymentStatus.FINISHED;
        case 4:
            return PaymentStatus.WITHDRAWN;
        default:
            return null;
    }
}

export default class PaymentEventEntity {
    id: number;
    // nftId: string;
    cudosAddress: string;
    amount: BigNumber;
    payee: string;

    constructor() {
        this.id = null;
        // this.nftId = '';
        this.cudosAddress = '';
        this.amount = null;
        this.payee = '';
    }

    isValid(): boolean {
        return this.id !== null
            // && this.nftId !== ''
            && this.cudosAddress !== ''
            && this.amount !== null
            && this.payee !== ''
    }

    static fromContractEvent(event: any): PaymentEventEntity {
        const entity = new PaymentEventEntity();
        const args = event.args;

        entity.id = args.paymentId ? parseInt(args.paymentId) : entity.id;
        // entity.nftId = args.paymentId ? utils.toUtf8String(args.paymentId) : entity.nftId;
        entity.cudosAddress = args.cudosAddress ? utils.toUtf8String(args.cudosAddress) : entity.cudosAddress;
        entity.amount = args.amount ? new BigNumber(args.amount.toString()).shiftedBy(-18) : entity.amount;
        entity.payee = args.sender ?? entity.payee;

        return entity;
    }
}
