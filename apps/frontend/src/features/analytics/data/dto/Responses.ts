import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import UserEarningsEntity from '../../entities/UserEarningsEntity';

export class ResFetchNftEarningsBySessionAccount {

    userEarningsEntity: UserEarningsEntity;

    constructor(axiosData: any) {
        this.userEarningsEntity = UserEarningsEntity.fromJson(axiosData.userEarningsEntity);
    }

}

export class ResFetchNftEarningsByNftId {

    nftEarningsEntity: NftEarningsEntity;

    constructor(axiosData: any) {
        this.nftEarningsEntity = NftEarningsEntity.fromJson(axiosData.nftEarningsEntity);
    }

}

export class ResFetchNftEarningsByMiningFarmId {

    miningFarmEarningsEntity: MiningFarmEarningsEntity;

    constructor(axiosData: any) {
        this.miningFarmEarningsEntity = MiningFarmEarningsEntity.fromJson(axiosData.miningFarmEarningsEntity);
    }

}
