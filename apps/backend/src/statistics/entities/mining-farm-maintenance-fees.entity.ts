import BigNumber from 'bignumber.js';

export default class MiningFarmMaintenanceFeeEntity {
    maintenanceFeeInBtc: BigNumber;

    constructor() {
        this.maintenanceFeeInBtc = null;
    }

    static toJson(entity: MiningFarmMaintenanceFeeEntity) {
        if (entity === null) {
            return null;
        }
        return {
            'maintenanceFeeInBtc': entity.maintenanceFeeInBtc.toString(),
        }
    }
}
