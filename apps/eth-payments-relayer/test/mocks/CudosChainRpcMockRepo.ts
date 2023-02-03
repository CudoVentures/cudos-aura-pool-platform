import AddressbookEntryEntity from '../../src/entities/AddressbookEntryEntity';
import NftEntity from '../../src/entities/NftEntity';
import PaymentEventEntity from '../../src/entities/PaymentEventEntity';
import PaymentTransactionEntity from '../../src/entities/PaymentTransactionEntity';
import RefundTransactionEntity from '../../src/entities/RefundTransactionEntity';
import CudosChainRepo from '../../src/workers/repos/CudosChainRepo';

const refundTransactionEntities = [];
const paymentTransactionEntity = new PaymentTransactionEntity();

function createAddressbookEntry(cudosAddress: string, entryAddress: string, label: string, network: string): AddressbookEntryEntity {
    const entity = new AddressbookEntryEntity();

    entity.cudosAddress = cudosAddress;
    entity.entryAdress = entryAddress;
    entity.label = label;
    entity.network = network;

    return entity
}

export class CudosChainRpcHappyPathMockRepo implements CudosChainRepo {
    async fetchCurrentBlockHeight(): Promise<number> { return 3 }
    async fetchAddressbookEntry(cudosAddress: string): Promise<AddressbookEntryEntity> {
        return createAddressbookEntry(cudosAddress, '0xtest', 'aurapool', 'aurapool');
    }
    async fetchRefundTransactions(fromHeight: number, toHeight: number): Promise<RefundTransactionEntity[]> { return refundTransactionEntities; }
    async fetchPaymentTransactionByTxhash(txHash: string): Promise<PaymentTransactionEntity> { return paymentTransactionEntity; }
    async sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity, nftEntity: NftEntity): Promise<string> { return 'txHash'; }
}

export class CudosChainRpcNoAddressbookEntryMockRepo implements CudosChainRepo {
    async fetchCurrentBlockHeight(): Promise<number> { return 3 }
    async fetchAddressbookEntry(cudosAddress: string): Promise<AddressbookEntryEntity> {
        return createAddressbookEntry('', '', '', '');
    }
    async fetchRefundTransactions(fromHeight: number, toHeight: number): Promise<RefundTransactionEntity[]> { return refundTransactionEntities; }
    async fetchPaymentTransactionByTxhash(txHash: string): Promise<PaymentTransactionEntity> { return paymentTransactionEntity; }
    async sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity, nftEntity: NftEntity): Promise<string> { return 'txHash'; }
}

export class CudosChainRpcLowBlockMockRepo implements CudosChainRepo {
    async fetchCurrentBlockHeight(): Promise<number> { return 1 }
    async fetchAddressbookEntry(cudosAddress: string): Promise<AddressbookEntryEntity> {
        return createAddressbookEntry(cudosAddress, '0xtest', 'aurapool', 'aurapool');
    }
    async fetchRefundTransactions(fromHeight: number, toHeight: number): Promise<RefundTransactionEntity[]> { return refundTransactionEntities; }
    async fetchPaymentTransactionByTxhash(txHash: string): Promise<PaymentTransactionEntity> { return paymentTransactionEntity; }
    async sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity, nftEntity: NftEntity): Promise<string> { return 'txHash'; }
}

export class CudosChainRpcFailToMintMockRepo implements CudosChainRepo {
    async fetchCurrentBlockHeight(): Promise<number> { return 1 }
    async fetchAddressbookEntry(cudosAddress: string): Promise<AddressbookEntryEntity> {
        return createAddressbookEntry(cudosAddress, '0xtest', 'aurapool', 'aurapool');
    }
    async fetchRefundTransactions(fromHeight: number, toHeight: number): Promise<RefundTransactionEntity[]> { return refundTransactionEntities; }
    async fetchPaymentTransactionByTxhash(txHash: string): Promise<PaymentTransactionEntity> { return paymentTransactionEntity; }
    async sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity, nftEntity: NftEntity): Promise<string> { throw Error('Failed to mint') }
}
