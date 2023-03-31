import BigNumber from 'bignumber.js';
import { formatBtc } from '../../core/utilities/NumberFormatter';

export default class MiningFarmMaintenanceFeeEntity {

    maintenanceFeeInBtc: BigNumber;

    constructor() {
        this.maintenanceFeeInBtc = new BigNumber(0);
    }

    formatMaintenanceFeeDepositedInBtcInt(): string {
        const value = this.maintenanceFeeInBtc.toFixed(0)
        return formatBtc(Number(value), false, 0)
    }

    formatMaintenanceFeeDepositedInBtcFraction(): string {
        return this.maintenanceFeeInBtc.minus(this.maintenanceFeeInBtc.integerValue()).shiftedBy(4).toFixed(0);
    }

    static fromJson(json: any): MiningFarmMaintenanceFeeEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmMaintenanceFeeEntity();

        entity.maintenanceFeeInBtc = new BigNumber(json.maintenanceFeeInBtc ?? entity.maintenanceFeeInBtc);

        return entity;
    }

}
