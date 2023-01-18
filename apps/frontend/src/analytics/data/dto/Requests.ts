import EarningsPerDayFilterEntity from '../../entities/EarningsPerDayFilterEntity';
import MegaWalletEventFilterModel from '../../entities/MegaWalletEventFilterModel';
import NftEventFilterModel from '../../entities/NftEventFilterModel';

export class ReqNftEventEntitiesByFilter {
    nftEventFilterEntity: NftEventFilterModel;

    constructor(nftEventFilterEntity: NftEventFilterModel) {
        this.nftEventFilterEntity = NftEventFilterModel.toJson(nftEventFilterEntity);
    }
}

export class ReqMegaWalletEventEntitiesByFilter {
    megaWalletEventFilterEntity: MegaWalletEventFilterModel;

    constructor(megaWalletEventFilterEntity: MegaWalletEventFilterModel) {
        this.megaWalletEventFilterEntity = MegaWalletEventFilterModel.toJson(megaWalletEventFilterEntity);
    }
}

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

export class ReqFetchTotalNftEarnings {

    timestampFrom: number;
    timestampTo: number

    constructor(timestampFrom: number, timestampTo: number) {
        this.timestampFrom = timestampFrom;
        this.timestampTo = timestampTo;
    }

}

export class ReqFetchEarningsPerDay {

    earningsPerDayFilterEntity: EarningsPerDayFilterEntity;

    constructor(earningsPerDayFilterEntity: EarningsPerDayFilterEntity) {
        this.earningsPerDayFilterEntity = EarningsPerDayFilterEntity.toJson(earningsPerDayFilterEntity);
    }

}

export class ReqFetchMiningFarmMaintenanceFee {

    miningFarmId: string;

    constructor(miningFarmId: string) {
        this.miningFarmId = miningFarmId;
    }

}

export class ReqFetchMiningFarmTotalEarningsBtc {

    miningFarmId: string;

    constructor(miningFarmId: string) {
        this.miningFarmId = miningFarmId;
    }

}

export class ReqFetchMiningFarmTotalEarningsCudos {

    miningFarmId: string;

    constructor(miningFarmId: string) {
        this.miningFarmId = miningFarmId;
    }

}
