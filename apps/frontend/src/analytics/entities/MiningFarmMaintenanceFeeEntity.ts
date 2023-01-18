import BigNumber from 'bignumber.js';
import numeral from 'numeral';

export default class MiningFarmMaintenanceFeeEntity {

    maintenanceFeeInBtc: BigNumber;

    constructor() {
        this.maintenanceFeeInBtc = new BigNumber(0);
    }

    formatMaintenanceFeeDepositedInBtcInt(): string {
        const value = this.maintenanceFeeInBtc.toFixed(0)
        return numeral(value).format('0,0');
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
