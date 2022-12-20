import NftEventEntity from '../entities/nft-event.entity';
import MiningFarmEarningsEntity from '../entities/mining-farm-earnings.entity';
import NftEarningsEntity from '../entities/nft-earnings.entity';
import UserEarningsEntity from '../entities/user-earnings.entity';
import NftEntity from '../../nft/entities/nft.entity';
import TotalEarningsEntity from '../entities/platform-earnings.entity';

export class ResNftEventsByFilter {
    nftEventEntities: NftEventEntity[];
    nftEntities: NftEntity[]
    total: number;

    constructor(nftEventEntities: NftEventEntity[], nftEntities: NftEntity[], total: number) {
        this.nftEventEntities = nftEventEntities.map((entity) => NftEventEntity.toJson(entity));
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
