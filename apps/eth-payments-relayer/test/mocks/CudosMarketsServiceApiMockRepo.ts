/* eslint-disable @typescript-eslint/no-empty-function */
import BigNumber from 'bignumber.js';
import CudosPriceDataEntity from '../../src/entities/CudosPriceDataEntity';
import NftEntity, { NftStatus } from '../../src/entities/NftEntity';
import PurchaseTransactionEntity from '../../src/entities/PurchaseTransactionEntity';
import CudosMarketsServiceRepo from '../../src/workers/repos/CudosMarketsServiceRepo';

const nftEntities = [
    createNftEntity('id1', '1000'),
    createNftEntity('id2', '1000'),
    createNftEntity('id3', '1000'),
    createNftEntity('id4', '1000'),
    createNftEntity('id5', '1000'),
    createNftEntity('id6', '1000'),
];

function createNftEntity(nftId: string, priceInAcudos: string): NftEntity {
    const entity = new NftEntity();

    entity.id = nftId;
    entity.priceInAcudos = new BigNumber(priceInAcudos);
    entity.priceValidUntil = Date.now() + 1000000;
    entity.status = NftStatus.QUEUED;

    return entity;
}

export class CudosMarketsServiceHappyPathApiRepo implements CudosMarketsServiceRepo {
    async fetchHeartbeat(): Promise< void > {}
    async fetchLastCheckedEthereumBlock(): Promise < number > { return 1 }
    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > { return 1 }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {}
    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {}

    async creditPurchaseTransactions(purchaseTransactionEntities: PurchaseTransactionEntity[]): Promise < void > {}
    async fetchCudosPriceData(): Promise<CudosPriceDataEntity> {
        return CudosPriceDataEntity.fromJson({
            'cudosUsdPrice': 1,
            'cudosEthPrice': new BigNumber(1),
            'priceChangeInUsd': 1,
        })
    }
}

export class CudosMarketsServiceDifferentPriceApiRepo implements CudosMarketsServiceRepo {
    async fetchHeartbeat(): Promise< void > {}
    async fetchLastCheckedEthereumBlock(): Promise < number > { return 1 }
    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > { return 1 }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {}
    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {}

    async creditPurchaseTransactions(purchaseTransactionEntities: PurchaseTransactionEntity[]): Promise < void > {}
    async fetchCudosPriceData(): Promise<CudosPriceDataEntity> {
        return CudosPriceDataEntity.fromJson({
            'cudosUsdPrice': 1,
            'cudosEthPrice': new BigNumber(1),
            'priceChangeInUsd': 1,
        })
    }
}

export class CudosMarketsServiceApiNoNftsFoundMockRepo implements CudosMarketsServiceRepo {
    async fetchHeartbeat(): Promise< void > {}
    async fetchLastCheckedEthereumBlock(): Promise < number > { return 1 }
    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > { return 1 }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {}
    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {}

    async creditPurchaseTransactions(purchaseTransactionEntities: PurchaseTransactionEntity[]): Promise < void > {}
    async fetchCudosPriceData(): Promise<CudosPriceDataEntity> {
        return CudosPriceDataEntity.fromJson({
            'cudosUsdPrice': 1,
            'cudosEthPrice': new BigNumber(1),
            'priceChangeInUsd': 1,
        })
    }
}

export class CudosMarketsServiceHighBlockCheckedMockRepo implements CudosMarketsServiceRepo {
    async fetchHeartbeat(): Promise< void > {}
    async fetchLastCheckedEthereumBlock(): Promise < number > { return 10 }
    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > { return 10 }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {}
    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {}

    async creditPurchaseTransactions(purchaseTransactionEntities: PurchaseTransactionEntity[]): Promise < void > {}
    async fetchCudosPriceData(): Promise<CudosPriceDataEntity> {
        return CudosPriceDataEntity.fromJson({
            'cudosUsdPrice': 1,
            'cudosEthPrice': new BigNumber(1),
            'priceChangeInUsd': 1,
        })
    }
}
