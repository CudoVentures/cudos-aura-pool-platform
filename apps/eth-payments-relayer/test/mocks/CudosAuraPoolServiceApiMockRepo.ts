/* eslint-disable @typescript-eslint/no-empty-function */
import BigNumber from 'bignumber.js';
import NftEntity, { NftStatus } from '../../src/entities/NftEntity';
import CudosAuraPoolServiceRepo from '../../src/workers/repos/CudosAuraPoolServiceRepo';

const nftEntities = [
    createNftEntity('id1', '1000', '0.0001'),
    createNftEntity('id2', '1000', '0.0001'),
    createNftEntity('id3', '1000', '0.0001'),
    createNftEntity('id4', '1000', '0.0001'),
    createNftEntity('id5', '1000', '0.0001'),
    createNftEntity('id6', '1000', '0.0001'),
];

function createNftEntity(nftId: string, priceInAcudos: string, priceInEth: string): NftEntity {
    const entity = new NftEntity();

    entity.id = nftId;
    entity.priceInAcudos = new BigNumber(priceInAcudos);
    entity.priceInEth = new BigNumber(priceInEth);
    entity.priceValidUntil = Date.now() + 1000000;
    entity.status = NftStatus.QUEUED;

    return entity;
}

export class CudosAuraPoolServiceHappyPathApiRepo implements CudosAuraPoolServiceRepo {
    async fetchHeartbeat(): Promise< void > {}
    async fetchLastCheckedEthereumBlock(): Promise < number > { return 1 }
    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > { return 1 }

    async fetchRandomNftForMint(): Promise < NftEntity > {
        return nftEntities[0];
    }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {}
    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {}
    async updateNftPrice(id: string): Promise < void > {}
}

export class CudosAuraPoolServiceDifferentPriceApiRepo implements CudosAuraPoolServiceRepo {
    async fetchHeartbeat(): Promise< void > {}
    async fetchLastCheckedEthereumBlock(): Promise < number > { return 1 }
    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > { return 1 }

    async fetchRandomNftForMint(): Promise < NftEntity > {
        const changedNftEntity = Object.assign(new NftEntity(), nftEntities[0]);
        changedNftEntity.priceInEth = new BigNumber(123);

        return changedNftEntity;
    }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {}
    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {}
    async updateNftPrice(id: string): Promise < void > {}
}

export class CudosAuraPoolServiceApiNoNftsFoundMockRepo implements CudosAuraPoolServiceRepo {
    async fetchHeartbeat(): Promise< void > {}
    async fetchLastCheckedEthereumBlock(): Promise < number > { return 1 }
    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > { return 1 }

    async fetchRandomNftForMint(): Promise < NftEntity > {
        return null
    }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {}
    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {}
    async updateNftPrice(id: string): Promise < void > {}
}

export class CudosAuraPoolServiceHighBlockCheckedMockRepo implements CudosAuraPoolServiceRepo {
    async fetchHeartbeat(): Promise< void > {}
    async fetchLastCheckedEthereumBlock(): Promise < number > { return 10 }
    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > { return 10 }

    async fetchRandomNftForMint(): Promise < NftEntity > {
        return null
    }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {}
    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {}
    async updateNftPrice(id: string): Promise < void > {}
}
