import MiningFarmEntity from '../entities/mining-farm.entity';
import { MiningFarmJsonValidator } from '../farm.types';

export class ResCreditMiningFarm {

    miningFarmEntity: MiningFarmJsonValidator;

    constructor(miningFarmEntity: MiningFarmEntity) {
        this.miningFarmEntity = MiningFarmEntity.toJson(miningFarmEntity);
    }

}
