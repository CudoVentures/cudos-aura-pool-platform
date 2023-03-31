import PaymentEventEntity, { parsePaymentStatus, PaymentStatus } from '../entities/PaymentEventEntity';
import AuraContractRepo from '../workers/repos/AuraContractRepo';
import { ethers } from 'ethers';

export default class AuraContractRpcRepo implements AuraContractRepo {
    contract: ethers.Contract;

    constructor(contract: ethers.Contract) {
        this.contract = contract
    }

    async fetchEvents(lastCheckedBlockHeight: number, currentBlockHeight: number): Promise<PaymentEventEntity[]> {
        const paymentEvents = await this.contract.queryFilter('NftMinted', lastCheckedBlockHeight, currentBlockHeight);
        const parseEvents = [];
        for (let i = 0; i < paymentEvents.length; i++) {
            const paymentEvent = paymentEvents[i];
            const block = await paymentEvent.getBlock();
            parseEvents.push(PaymentEventEntity.fromContractEvent(paymentEvent, block.timestamp))
        }

        return parseEvents;
    }

    fetchCurrentBlockHeight(): Promise<number> {
        return this.contract.provider.getBlockNumber();
    }

    async fetchPaymentStatus(paymentId: number): Promise < PaymentStatus > {
        const statusString = await this.contract.getPaymentStatus(paymentId);
        const status = parsePaymentStatus(statusString);

        if (status === null) {
            throw Error(`Invalid status: ${status}`);
        }
        return status;
    }

    async markPaymentWithdrawable(paymentId: number): Promise<string> {
        const tx = await this.contract.unlockPaymentWithdraw(paymentId);
        const transactionReceipt = await tx.wait();
        if (transactionReceipt.status !== 1) {
            throw Error(transactionReceipt);
        }

        return tx.hash;
    }

}
