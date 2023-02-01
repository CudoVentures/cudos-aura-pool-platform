import PaymentEventEntity from '../entities/PaymentEventEntity';
import AuraContractRepo from '../workers/repos/AuraContractRepo';
import { ethers } from 'ethers';

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

    markPaymentWithdrawable(nftId: string): Promise<string> {
        const tx = this.contract.unlockPaymentWithdraw(ethers.utils.parseBytes32String(nftId));
        if (!tx.transactionHash) {
            throw Error(tx.message);
        }

        return tx.transactionHash;
    }

}
