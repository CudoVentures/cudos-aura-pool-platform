/* eslint-disable @typescript-eslint/no-empty-function */
import BigNumber from 'bignumber.js';
import NftEntity, { NftStatus } from '../../src/entities/NftEntity';
import CudosAuraPoolServiceRepo from '../../src/workers/repos/CudosAuraPoolServiceRepo';

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

export class CudosAuraPoolServiceHappyPathApiRepo implements CudosAuraPoolServiceRepo {
    async fetchHeartbeat(): Promise< void > {}
    async fetchLastCheckedEthereumBlock(): Promise < number > { return 1 }
    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > { return 1 }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {}
    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {}
}

export class CudosAuraPoolServiceDifferentPriceApiRepo implements CudosAuraPoolServiceRepo {
    async fetchHeartbeat(): Promise< void > {}
    async fetchLastCheckedEthereumBlock(): Promise < number > { return 1 }
    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > { return 1 }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {}
    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {}
}

export class CudosAuraPoolServiceApiNoNftsFoundMockRepo implements CudosAuraPoolServiceRepo {
    async fetchHeartbeat(): Promise< void > {}
    async fetchLastCheckedEthereumBlock(): Promise < number > { return 1 }
    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > { return 1 }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {}
    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {}
}

export class CudosAuraPoolServiceHighBlockCheckedMockRepo implements CudosAuraPoolServiceRepo {
    async fetchHeartbeat(): Promise< void > {}
    async fetchLastCheckedEthereumBlock(): Promise < number > { return 10 }
    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > { return 10 }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {}
    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {}
}
