import MiningFarmEntity from '../../entities/MiningFarmEntity';

export class ReqCreditMiningFarm {

    miningFarmEntity: MiningFarmEntity;

    constructor(miningFarmEntity: MiningFarmEntity) {
        this.miningFarmEntity = MiningFarmEntity.toJson(miningFarmEntity);
    }

}
