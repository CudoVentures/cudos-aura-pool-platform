import BigNumber from 'bignumber.js';

export default class PlatformMaintenanceFeeEntity {
    maintenanceFeeInBtc: BigNumber;

    constructor() {
        this.maintenanceFeeInBtc = null;
    }

    static toJson(entity: PlatformMaintenanceFeeEntity) {
        if (entity === null) {
            return null;
        }
        return {
            'maintenanceFeeInBtc': entity.maintenanceFeeInBtc.toString(),
        }
    }
}
