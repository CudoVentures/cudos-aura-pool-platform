import NftEventEntity from '../entities/nft-event.entity';
import MiningFarmEarningsEntity from '../entities/mining-farm-earnings.entity';
import NftEarningsEntity from '../entities/nft-earnings.entity';
import UserEarningsEntity from '../entities/user-earnings.entity';
import NftEntity from '../../nft/entities/nft.entity';
import TotalEarningsEntity from '../entities/platform-earnings.entity';
import MegaWalletEventEntity from '../entities/mega-wallet-event.entity';
import EarningsEntity from '../entities/platform-earnings.entity';
import MiningFarmMaintenanceFeeEntity from '../entities/mining-farm-maintenance-fees.entity';
import MiningFarmTotalEarningsBtcEntity from '../entities/mining-farm-btc-earnings.entity';
import PlatformMaintenanceFeeEntity from '../entities/platform-maintenance-fee.entity';
import PlatformTotalEarningsBtcEntity from '../entities/platform-total-earnings-btc.entity';
import MiningFarmTotalEarningsCudosEntity from '../entities/mining-farm-cudos-earnings.entity';
import PlatformTotalEarningsCudosEntity from '../entities/platform-total-earnings-cudos.entity';

export class ResNftEventsByFilter {
    nftEventEntities: NftEventEntity[];
    nftEntities: any[]
    total: number;

    constructor(nftEventEntities: NftEventEntity[], nftEntities: NftEntity[], total: number) {
        this.nftEventEntities = nftEventEntities.map((entity) => NftEventEntity.toJson(entity));
        this.nftEntities = nftEntities.map((entity) => NftEntity.toJson(entity));
        this.total = total;
    }
}

export class ResMegaWalletEventsByFilter {
    megaWalletEventEntities: MegaWalletEventEntity[];
    nftEntities: any[]
    total: number;

    constructor(megaWalletEventEntities: MegaWalletEventEntity[], nftEntities: NftEntity[], total: number) {
        this.megaWalletEventEntities = megaWalletEventEntities.map((entity) => MegaWalletEventEntity.toJson(entity));
        this.nftEntities = nftEntities.map((entity) => NftEntity.toJson(entity));
        this.total = total;
    }
}

export class ResFetchNftEarningsBySessionAccount {

    userEarningsEntity: any;

    constructor(userEarningsEntity: UserEarningsEntity) {
        this.userEarningsEntity = UserEarningsEntity.toJson(userEarningsEntity);
    }

}

export class ResFetchNftEarningsByNftId {

    nftEarningsEntity: any;

    constructor(nftEarningsEntity: NftEarningsEntity) {
        this.nftEarningsEntity = NftEarningsEntity.toJson(nftEarningsEntity);
    }

}

export class ResFetchNftEarningsByMiningFarmId {

    miningFarmEarningsEntity: any;

    constructor(miningFarmEarningsEntity: MiningFarmEarningsEntity) {
        this.miningFarmEarningsEntity = MiningFarmEarningsEntity.toJson(miningFarmEarningsEntity);
    }

}

export class ResFetchTotalNftEarnings {

    totalEarningsEntity: any;

    constructor(totalEarningsEntity: TotalEarningsEntity) {
        this.totalEarningsEntity = TotalEarningsEntity.toJson(totalEarningsEntity);
    }

}

export class ResFetchEarningsPerDay {

    earningsEntity: any;

    constructor(earningsEntity: EarningsEntity) {
        this.earningsEntity = EarningsEntity.toJson(earningsEntity);
    }
}

export class ResFetchMiningFarmMaintenanceFee {
    miningFarmMaintenanceFeeEntity: any;

    constructor(miningFarmMaintenanceFeeEntity: MiningFarmMaintenanceFeeEntity) {
        this.miningFarmMaintenanceFeeEntity = MiningFarmMaintenanceFeeEntity.toJson(miningFarmMaintenanceFeeEntity);
    }
}

export class ResFetchFarmTotalBtcEarnings {
    miningFarmTotalEarningsBtcEntity: any;

    constructor(miningFarmTotalEarningsBtcEntity: MiningFarmTotalEarningsBtcEntity) {
        this.miningFarmTotalEarningsBtcEntity = MiningFarmTotalEarningsBtcEntity.toJson(miningFarmTotalEarningsBtcEntity);
    }
}

export class ResFetchMiningFarmTotalEarningsCudos {
    miningFarmTotalEarningsCudosEntity: any;

    constructor(miningFarmTotalEarningsCudosEntity: MiningFarmTotalEarningsCudosEntity) {
        this.miningFarmTotalEarningsCudosEntity = MiningFarmTotalEarningsCudosEntity.toJson(miningFarmTotalEarningsCudosEntity);
    }
}

export class ResFetchPlatformMaintenanceFee {
    platformMaintenanceFeeEntity: any;

    constructor(platformMaintenanceFeeEntity: PlatformMaintenanceFeeEntity) {
        this.platformMaintenanceFeeEntity = PlatformMaintenanceFeeEntity.toJson(platformMaintenanceFeeEntity);
    }
}

export class ResFetchPlatformTotalEarningsBtc {
    platformTotalEarningsBtcEntity: any;

    constructor(platformTotalEarningsBtcEntity: PlatformTotalEarningsBtcEntity) {
        this.platformTotalEarningsBtcEntity = PlatformTotalEarningsBtcEntity.toJson(platformTotalEarningsBtcEntity);
    }
}

export class ResFetchPlatformTotalEarningsCudos {
    platformTotalEarningsCudosEntity: any;

    constructor(platformTotalEarningsCudosEntity: PlatformTotalEarningsCudosEntity) {
        this.platformTotalEarningsCudosEntity = PlatformTotalEarningsCudosEntity.toJson(platformTotalEarningsCudosEntity);
    }
}
