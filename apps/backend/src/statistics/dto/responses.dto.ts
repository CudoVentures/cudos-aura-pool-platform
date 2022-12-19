import MiningFarmEarningsEntity from '../entities/mining-farm-earnings.entity';
import NftEarningsEntity from '../entities/nft-earnings.entity';
import { TransferHistoryEntity } from '../entities/transfer-history.entity';
import UserEarningsEntity from '../entities/user-earnings.entity';

export class ResTransferHistory {
    transferHistoryEntity: TransferHistoryEntity;
    total: number;

    constructor(nftEventEntities: TransferHistoryEntity, total: number) {
        this.transferHistoryEntity = TransferHistoryEntity.toJson(nftEventEntities);
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
