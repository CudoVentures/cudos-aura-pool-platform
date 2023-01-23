import BigNumber from 'bignumber.js';

export default class PlatformTotalEarningsBtcEntity {
    nftFeesTotalEarningsInBtc: BigNumber;

    constructor() {
        this.nftFeesTotalEarningsInBtc = null;
    }

    static toJson(entity: PlatformTotalEarningsBtcEntity) {
        if (entity === null) {
            return null;
        }
        return {
            'nftFeesTotalEarningsInBtc': entity.nftFeesTotalEarningsInBtc.toString(10),
        }
    }
}
