import CudosPriceDataEntity from '../../entities/CudosPriceDataEntity';
import NftEntity from '../../entities/NftEntity';

export class ResFetchLastCheckedBlocks {
    lastCheckedEthBlock: number;
    lastCheckedCudosBlock: number;

    constructor(data) {
        this.lastCheckedEthBlock = parseInt(data.lastCheckedEthBlock);
        this.lastCheckedCudosBlock = parseInt(data.lastCheckedCudosBlock);
    }
}

export class ResFetchRandomNftForPresaleMint {
    nftEntity: NftEntity;

    constructor(data) {
        this.nftEntity = NftEntity.fromJson(data.nftEntity);
    }
}

export class ResFetchCudosPriceData {
    cudosPriceDataEntity: CudosPriceDataEntity;

    constructor(data) {
        this.cudosPriceDataEntity = CudosPriceDataEntity.fromJson(data.cudosDataEntity);
    }
}
