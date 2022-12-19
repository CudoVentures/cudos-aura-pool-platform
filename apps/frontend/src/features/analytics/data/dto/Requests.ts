export class ReqFetchNftEarningsBySessionAccount {

    timestampFrom: number;
    timestampTo: number

    constructor(timestampFrom: number, timestampTo: number) {
        this.timestampFrom = timestampFrom;
        this.timestampTo = timestampTo;
    }

}

export class ReqFetchNftEarningsByNftId {

    nftId: string;
    timestampFrom: number;
    timestampTo: number

    constructor(nftId: string, timestampFrom: number, timestampTo: number) {
        this.nftId = nftId;
        this.timestampFrom = timestampFrom;
        this.timestampTo = timestampTo;
    }

}

export class ReqFetchNftEarningsByMiningFarmId {

    miningFarmId: string;
    timestampFrom: number;
    timestampTo: number

    constructor(miningFarmId: string, timestampFrom: number, timestampTo: number) {
        this.miningFarmId = miningFarmId;
        this.timestampFrom = timestampFrom;
        this.timestampTo = timestampTo;
    }

}
