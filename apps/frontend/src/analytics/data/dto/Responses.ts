import NftEntity from '../../../nft/entities/NftEntity';
import EarningsPerDayEntity from '../../entities/EarningsPerDayEntity';
import MegaWalletEventEntity from '../../entities/MegaWalletEventEntity';
import MiningFarmMaintenanceFeeEntity from '../../entities/MiningFarmMaintenanceFeeEntity';
import MiningFarmTotalEarningsBtcEntity from '../../entities/MiningFarmTotalEarningsBtcEntity';
import MiningFarmTotalEarningsCudosEntity from '../../entities/MiningFarmTotalEarningsCudosEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventEntity from '../../entities/NftEventEntity';
import PlatformMaintenanceFeeEntity from '../../entities/PlatformMaintenanceFeeEntity';
import PlatformTotalEarningsBtcEntity from '../../entities/PlatformTotalEarningsBtcEntity';
import PlatformTotalEarningsCudosEntity from '../../entities/PlatformTotalEarningsCudosEntity';
import UserEarningsEntity from '../../entities/UserEarningsEntity';

export class ResNftEventEntitiesByFilter {
    nftEventEntities: NftEventEntity[];
    nftEntities: NftEntity[];
    total: number;

    constructor(axiosData: any) {
        this.nftEventEntities = axiosData.nftEventEntities.map((json) => NftEventEntity.fromJson(json));
        this.nftEntities = axiosData.nftEntities.map((json) => NftEntity.fromJson(json));
        this.total = axiosData.total;
    }
}

export class ResMegaWalletEventEntitiesByFilter {
    megaWalletEventEntities: MegaWalletEventEntity[];
    nftEntities: NftEntity[];
    total: number;

    constructor(axiosData: any) {
        this.megaWalletEventEntities = axiosData.megaWalletEventEntities.map((json) => MegaWalletEventEntity.fromJson(json));
        this.nftEntities = axiosData.nftEntities.map((json) => NftEntity.fromJson(json));
        this.total = axiosData.total;
    }
}

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

export class ResFetchEarningsPerDay {

    earningsPerDayEntity: EarningsPerDayEntity;

    constructor(axiosData: any) {
        this.earningsPerDayEntity = EarningsPerDayEntity.fromJson(axiosData.earningsPerDayEntity);
    }

}

export class ResFetchMiningFarmMaintenanceFee {

    miningFarmMaintenanceFeeEntity: MiningFarmMaintenanceFeeEntity;

    constructor(axiosData: any) {
        this.miningFarmMaintenanceFeeEntity = MiningFarmMaintenanceFeeEntity.fromJson(axiosData.miningFarmMaintenanceFeeEntity);
    }

}

export class ResFetchMiningFarmTotalEarningsBtc {

    miningFarmTotalEarningsBtcEntity: MiningFarmTotalEarningsBtcEntity;

    constructor(axiosData: any) {
        this.miningFarmTotalEarningsBtcEntity = MiningFarmTotalEarningsBtcEntity.fromJson(axiosData.miningFarmTotalEarningsBtcEntity);
    }

}

export class ResFetchMiningFarmTotalEarningsCudos {

    miningFarmTotalEarningsCudosEntity: MiningFarmTotalEarningsCudosEntity;

    constructor(axiosData: any) {
        this.miningFarmTotalEarningsCudosEntity = MiningFarmTotalEarningsCudosEntity.fromJson(axiosData.miningFarmTotalEarningsCudosEntity);
    }

}

export class ResFetchPlatformMaintenanceFee {

    platformMaintenanceFeeEntity: PlatformMaintenanceFeeEntity;

    constructor(axiosData: any) {
        this.platformMaintenanceFeeEntity = PlatformMaintenanceFeeEntity.fromJson(axiosData.platformMaintenanceFeeEntity);
    }

}

export class ResFetchPlatformTotalEarningsBtc {

    platformTotalEarningsBtcEntity: PlatformTotalEarningsBtcEntity;

    constructor(axiosData: any) {
        this.platformTotalEarningsBtcEntity = PlatformTotalEarningsBtcEntity.fromJson(axiosData.platformTotalEarningsBtcEntity);
    }

}

export class ResFetchPlatformTotalEarningsCudos {

    platformTotalEarningsCudosEntity: PlatformTotalEarningsCudosEntity;

    constructor(axiosData: any) {
        this.platformTotalEarningsCudosEntity = PlatformTotalEarningsCudosEntity.fromJson(axiosData.platformTotalEarningsCudosEntity);
    }

}
