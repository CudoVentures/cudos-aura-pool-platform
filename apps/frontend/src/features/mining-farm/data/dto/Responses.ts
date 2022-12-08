import MiningFarmEntity from '../../entities/MiningFarmEntity';

export class ResCreditMiningFarm {

    miningFarmEntity: MiningFarmEntity;

    constructor(axiosData: any) {
        this.miningFarmEntity = MiningFarmEntity.fromJson(axiosData.miningFarmEntity);
    }

}
