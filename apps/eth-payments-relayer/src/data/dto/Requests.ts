export class ReqFetchNftsByIds {
    nftFilterJson: any

    constructor(nftIds: string[]) {
        this.nftFilterJson = {
            nftIds,
            sessionAccount: 0,
            orderBy: 2,
            from: 0,
            count: Number.MAX_SAFE_INTEGER,
        };
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

export class ReqUpdateNftPrice {
    id: string;

    constructor(id: string) {
        this.id = id;
    }
}
