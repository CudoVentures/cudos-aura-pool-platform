import PaymentEventEntity, { parsePaymentStatus, PaymentStatus } from '../entities/PaymentEventEntity';
import AuraContractRepo from '../workers/repos/AuraContractRepo';
import { ethers } from 'ethers';
import Logger from '../../config/Logger';

export default class AuraContractRpcRepo implements AuraContractRepo {
    contract: ethers.Contract;

    constructor(contract: ethers.Contract) {
        this.contract = contract
    }

    async fetchEvents(lastCheckedBlockHeight: number, currentBlockHeight: number): Promise<PaymentEventEntity[]> {
        const paymentEvents = await this.contract.queryFilter('NftMinted', lastCheckedBlockHeight, currentBlockHeight);

        return paymentEvents.map((paymentEvent) => PaymentEventEntity.fromContractEvent(paymentEvent));
    }

    fetchCurrentBlockHeight(): Promise<number> {
        return this.contract.provider.getBlockNumber();
    }

    async fetchPaymentStatus(nftId: string): Promise < PaymentStatus > {
        const statusString = await this.contract.getPaymentStatus(ethers.utils.toUtf8Bytes(nftId));
        const status = parsePaymentStatus(statusString);

        if (status === null) {
            throw Error(`Invalid status: ${status}`);
        }
        return status;
    }

    async markPaymentWithdrawable(nftId: string): Promise<string> {
        const tx = await this.contract.unlockPaymentWithdraw(ethers.utils.toUtf8Bytes(nftId));
        const transactionReceipt = await tx.wait();
        if (transactionReceipt.status !== 1) {
            throw Error(transactionReceipt);
        }

        return tx.hash;
    }

}
