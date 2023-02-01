export class ReqFetchNftsByIds {
    nftFilterJson: any

    constructor(nftIds: string[]) {
        this.nftFilterJson.nftIds = nftIds
    }
}

export class ReqUpdateLastCheckedBlocks {
    lastCheckedEthBlock: number;
    lastCheckedCudosBlock: number;

    constructor(lastCheckedEthBlock: number, lastCheckedCudosBlock: number) {
        this.lastCheckedEthBlock = lastCheckedEthBlock
        this.lastCheckedCudosBlock = lastCheckedCudosBlock;
    }
}
