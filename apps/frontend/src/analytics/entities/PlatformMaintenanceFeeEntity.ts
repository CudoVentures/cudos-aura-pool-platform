import BigNumber from 'bignumber.js';
import { formatBtc } from '../../core/utilities/NumberFormatter';

export default class PlatformMaintenanceFeeEntity {

    maintenanceFeeInBtc: BigNumber;

    constructor() {
        this.maintenanceFeeInBtc = new BigNumber(0);
    }

    formatMaintenanceFeeDepositedInBtcInt(): string {
        return formatBtc(this.maintenanceFeeInBtc, false, 0);
    }

    formatMaintenanceFeeDepositedInBtcFraction(): string {
        return this.maintenanceFeeInBtc.minus(this.maintenanceFeeInBtc.integerValue()).shiftedBy(4).toFixed(0);
    }

    static fromJson(json: any): PlatformMaintenanceFeeEntity {
        if (json === null) {
            return null;
        }

        const entity = new PlatformMaintenanceFeeEntity();

        entity.maintenanceFeeInBtc = new BigNumber(json.maintenanceFeeInBtc ?? entity.maintenanceFeeInBtc);

        return entity;
    }

}
