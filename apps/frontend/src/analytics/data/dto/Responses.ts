import NftEntity from '../../../nft/entities/NftEntity';
import MegaWalletEventEntity from '../../entities/MegaWalletEventEntity';
import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventEntity from '../../entities/NftEventEntity';
import TotalEarningsEntity from '../../entities/TotalEarningsEntity';
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

export class ResFetchNftEarningsByMiningFarmId {

    miningFarmEarningsEntity: MiningFarmEarningsEntity;

    constructor(axiosData: any) {
        this.miningFarmEarningsEntity = MiningFarmEarningsEntity.fromJson(axiosData.miningFarmEarningsEntity);
    }

}

export class ResFetchTotalNftEarnings {

    totalEarningsEntity: TotalEarningsEntity;

    constructor(axiosData: any) {
        this.totalEarningsEntity = TotalEarningsEntity.fromJson(axiosData.totalEarningsEntity);
    }

}
