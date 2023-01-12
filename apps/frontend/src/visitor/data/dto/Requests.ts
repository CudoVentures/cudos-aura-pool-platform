import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import NftEntity from '../../../nft/entities/NftEntity';

export class ReqSignalVisitMiningFarm {

    miningFarmEntity: any;

    constructor(miningFarmEntity: MiningFarmEntity) {
        this.miningFarmEntity = MiningFarmEntity.toJson(miningFarmEntity);
    }

}

export class ReqSignalVisitNft {

    nftEntity: any;

    constructor(nftEntity: NftEntity) {
        this.nftEntity = NftEntity.toJson(nftEntity);
    }

}
