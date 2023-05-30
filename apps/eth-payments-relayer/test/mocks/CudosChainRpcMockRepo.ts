import Config from '../../config/Config';
import AddressbookEntryEntity from '../../src/entities/AddressbookEntryEntity';
import NftEntity from '../../src/entities/NftEntity';
import PaymentEventEntity from '../../src/entities/PaymentEventEntity';
import PaymentTransactionEntity from '../../src/entities/PaymentTransactionEntity';
import RefundTransactionEntity from '../../src/entities/RefundTransactionEntity';
import CudosChainRepo from '../../src/workers/repos/CudosChainRepo';
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

const refundTransactionEntities = [
    createRefundTransactionEntity(),
];

const paymentTransactionEntity = createPaymentTransactionEntity();

function createPaymentTransactionEntity(): PaymentTransactionEntity {
    const entity = new PaymentTransactionEntity();

    entity.contractPaymentId = 1;
    entity.from = 'testCudosSignerAddress';
    entity.to = 'testMintingServiceAddress';
    entity.nftId = 'nftId1';
    entity.recipientAddress = 'address1';
    entity.txBody = TxBody.fromPartial({});
    entity.ethTxHash = 'ethTxHash';
    entity.txBody.messages = [{
        typeUrl: 'test',
        value: Uint8Array.from([12]),
    }];
    return entity;
}

function createRefundTransactionEntity(): RefundTransactionEntity {
    const entity = new RefundTransactionEntity();

    entity.from = 'testMintingServiceAddress';
    entity.to = 'testCudosSignerAddress';
    entity.refundedTxHash = 'refundTx';
    entity.txBody = TxBody.fromPartial({});
    entity.txBody.messages = [{
        typeUrl: 'test',
        value: Uint8Array.from([12]),
    }];

    return entity;
}

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
        return createAddressbookEntry(cudosAddress, '0xtest', 'cudosmarkets', 'cudosmarkets');
    }
    async fetchRefundTransactions(fromHeight: number, toHeight: number): Promise<RefundTransactionEntity[]> { return refundTransactionEntities; }
    async fetchPaymentTransactionByTxhash(txHash: string): Promise<PaymentTransactionEntity> { return paymentTransactionEntity; }
    async sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity): Promise<string> { return 'txHash'; }
}

export class CudosChainRpcInvalidOriginalTxMockRepo implements CudosChainRepo {
    async fetchCurrentBlockHeight(): Promise<number> { return 3 }
    async fetchAddressbookEntry(cudosAddress: string): Promise<AddressbookEntryEntity> {
        return createAddressbookEntry(cudosAddress, '0xtest', 'cudosmarkets', 'cudosmarkets');
    }
    async fetchRefundTransactions(fromHeight: number, toHeight: number): Promise<RefundTransactionEntity[]> { return refundTransactionEntities; }
    async fetchPaymentTransactionByTxhash(txHash: string): Promise<PaymentTransactionEntity> { return null; }
    async sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity): Promise<string> { return 'txHash'; }
}

export class CudosChainRpcNoEventsMockRepo implements CudosChainRepo {
    async fetchCurrentBlockHeight(): Promise<number> { return 3 }
    async fetchAddressbookEntry(cudosAddress: string): Promise<AddressbookEntryEntity> {
        return createAddressbookEntry(cudosAddress, '0xtest', 'cudosmarkets', 'cudosmarkets');
    }
    async fetchRefundTransactions(fromHeight: number, toHeight: number): Promise<RefundTransactionEntity[]> { return []; }
    async fetchPaymentTransactionByTxhash(txHash: string): Promise<PaymentTransactionEntity> { return paymentTransactionEntity; }
    async sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity): Promise<string> { return 'txHash'; }
}

export class CudosChainRpcNoAddressbookEntryMockRepo implements CudosChainRepo {
    async fetchCurrentBlockHeight(): Promise<number> { return 3 }
    async fetchAddressbookEntry(cudosAddress: string): Promise<AddressbookEntryEntity> {
        return createAddressbookEntry('', '', '', '');
    }
    async fetchRefundTransactions(fromHeight: number, toHeight: number): Promise<RefundTransactionEntity[]> { return refundTransactionEntities; }
    async fetchPaymentTransactionByTxhash(txHash: string): Promise<PaymentTransactionEntity> { return paymentTransactionEntity; }
    async sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity): Promise<string> { return 'txHash'; }
}

export class CudosChainRpcLowBlockMockRepo implements CudosChainRepo {
    async fetchCurrentBlockHeight(): Promise<number> { return 1 }
    async fetchAddressbookEntry(cudosAddress: string): Promise<AddressbookEntryEntity> {
        return createAddressbookEntry(cudosAddress, '0xtest', 'cudosmarkets', 'cudosmarkets');
    }
    async fetchRefundTransactions(fromHeight: number, toHeight: number): Promise<RefundTransactionEntity[]> { return refundTransactionEntities; }
    async fetchPaymentTransactionByTxhash(txHash: string): Promise<PaymentTransactionEntity> { return paymentTransactionEntity; }
    async sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity): Promise<string> { return 'txHash'; }
}

export class CudosChainRpcFailToMintMockRepo implements CudosChainRepo {
    async fetchCurrentBlockHeight(): Promise<number> { return 1 }
    async fetchAddressbookEntry(cudosAddress: string): Promise<AddressbookEntryEntity> {
        return createAddressbookEntry(cudosAddress, '0xtest', 'cudosmarkets', 'cudosmarkets');
    }
    async fetchRefundTransactions(fromHeight: number, toHeight: number): Promise<RefundTransactionEntity[]> { return refundTransactionEntities; }
    async fetchPaymentTransactionByTxhash(txHash: string): Promise<PaymentTransactionEntity> { return paymentTransactionEntity; }
    async sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity): Promise<string> { throw Error('Failed to mint') }
}
