import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../../common/utils';
import { AddressesPayoutHistoryRepo } from '../repos/addresses-payout-history.repo';

export class AddressPayoutHistoryEntity {

    id: number;
    address: string;
    amountBtc: BigNumber;
    txHash: string;
    farmId: number
    createdAt: number;
    updatedAt: number;
    payoutTime: number;
    thresholdReached: boolean

    constructor() {
        this.id = NOT_EXISTS_INT;
        this.address = '';
        this.amountBtc = null;
        this.txHash = '';
        this.farmId = NOT_EXISTS_INT;
        this.createdAt = NOT_EXISTS_INT;
        this.updatedAt = NOT_EXISTS_INT;
        this.payoutTime = NOT_EXISTS_INT;
        this.thresholdReached = false;
    }

    static fromRepo(repoJson: AddressesPayoutHistoryRepo): AddressPayoutHistoryEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new AddressPayoutHistoryEntity();

        entity.id = repoJson.id ?? entity.id;
        entity.address = repoJson.address ?? entity.address;
        entity.amountBtc = repoJson.amount_btc ? new BigNumber(repoJson.amount_btc) : entity.amountBtc;
        entity.txHash = repoJson.tx_hash ?? entity.txHash;
        entity.farmId = repoJson.farm_id ?? entity.farmId;
        entity.createdAt = repoJson.createdAt?.getTime() ?? entity.createdAt;
        entity.updatedAt = repoJson.updatedAt?.getTime() ?? entity.updatedAt;
        entity.payoutTime = repoJson.payout_time ?? entity.payoutTime;
        entity.thresholdReached = repoJson.threshold_reached ?? entity.thresholdReached;

        return entity;
    }
}
