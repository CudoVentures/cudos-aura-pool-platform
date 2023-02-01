import NftEntity from '../../entities/NftEntity';

export class ResFetchLastCheckedBlocks {
    lastCheckedEthBlock: number;
    lastCheckedCudosBlock: number;

    constructor(data) {
        this.lastCheckedEthBlock = parseInt(data.lastCheckedEthBlock);
        this.lastCheckedCudosBlock = parseInt(data.lastCheckedCudosBlock);
    }
}

export class ResFetchNftsByIds {
    nftEntities: NftEntity[];

    constructor(data) {
        this.nftEntities = data.nftEntities.map((json) => NftEntity.fromJson(json));
    }
}
