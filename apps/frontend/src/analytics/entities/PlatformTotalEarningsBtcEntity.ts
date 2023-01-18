import BigNumber from 'bignumber.js';

export default class PlatformTotalEarningsBtcEntity {

    nftFeesTotalEarningsInBtc: BigNumber;

    constructor() {
        this.nftFeesTotalEarningsInBtc = new BigNumber(0);
    }

    static fromJson(json: any): PlatformTotalEarningsBtcEntity {
        if (json === null) {
            return null;
        }

        const entity = new PlatformTotalEarningsBtcEntity();

        entity.nftFeesTotalEarningsInBtc = new BigNumber(json.nftFeesTotalEarningsInBtc ?? entity.nftFeesTotalEarningsInBtc);

        return entity;
    }

}
