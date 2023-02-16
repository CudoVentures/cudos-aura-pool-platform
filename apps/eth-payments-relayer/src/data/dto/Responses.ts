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
