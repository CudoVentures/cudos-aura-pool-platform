import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../../common/utils';
import { NftPayoutHistoryRepo } from '../repos/nft-payout-history.repo';

export class NftPayoutHistoryEntity {

    id: number;
    tokenId: number;
    denomId: string;
    payoutPeriodStart: number;
    payoutPeriodEnd: number;
    reward: BigNumber;
    txHash: string;
    maintenanceFee: BigNumber;
    cudoPartOfMaintenanceFee: BigNumber;
    cudoPartOfReward: BigNumber;
    createdAt: number;
    updatedAt: number;

    constructor() {
        this.id = NOT_EXISTS_INT;
        this.tokenId = NOT_EXISTS_INT;
        this.denomId = '';
        this.payoutPeriodStart = NOT_EXISTS_INT;
        this.payoutPeriodEnd = NOT_EXISTS_INT;
        this.reward = null;
        this.txHash = '';
        this.maintenanceFee = null;
        this.cudoPartOfMaintenanceFee = null;
        this.cudoPartOfReward = null;
        this.createdAt = NOT_EXISTS_INT;
        this.updatedAt = NOT_EXISTS_INT;
    }

    static fromJson(json): NftPayoutHistoryEntity {
        const entity = new NftPayoutHistoryEntity();

        entity.id = parseInt(json.id ?? entity.id);
        entity.tokenId = parseInt(json.tokenId ?? entity.tokenId);
        entity.denomId = json.denomId ?? entity.denomId;
        entity.payoutPeriodStart = parseInt(json.payoutPeriodStart ?? entity.payoutPeriodStart);
        entity.payoutPeriodEnd = parseInt(json.payoutPeriodEnd ?? entity.payoutPeriodEnd);
        entity.reward = new BigNumber(json.reward ?? entity.reward);
        entity.txHash = json.txHash ?? entity.txHash;
        entity.maintenanceFee = new BigNumber(json.maintenanceFee ?? entity.maintenanceFee);
        entity.cudoPartOfMaintenanceFee = new BigNumber(json.cudoPartOfMaintenanceFee ?? entity.cudoPartOfMaintenanceFee);
        entity.cudoPartOfReward = new BigNumber(json.cudoPartOfReward ?? entity.cudoPartOfReward);
        entity.createdAt = parseInt(json.createdAt ?? entity.createdAt);
        entity.updatedAt = parseInt(json.updatedAt ?? entity.updatedAt);

        return entity;
    }

    // isNew(): boolean {
    //     return this.id === NOT_EXISTS_INT;
    // }

    static toRepo(entity: NftPayoutHistoryEntity): NftPayoutHistoryRepo {
        throw Error('Aura pool platfor must not write to this table');
        // if (entity === null) {
        //     return null;
        // }

        // const repoJson = new NftPayoutHistoryRepo();
        // if (entity.isNew() === false) {
        //     repoJson.id = entity.id;
        // }

        // return repoJson;
    }

    static fromRepo(repoJson: NftPayoutHistoryRepo): NftPayoutHistoryEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new NftPayoutHistoryEntity();

        entity.id = repoJson.id ?? entity.id;
        entity.tokenId = repoJson.token_id ?? entity.tokenId;
        entity.denomId = repoJson.denom_id ?? entity.denomId;
        entity.payoutPeriodStart = repoJson.payout_period_start ?? entity.payoutPeriodStart;
        entity.payoutPeriodEnd = repoJson.payout_period_end ?? entity.payoutPeriodEnd;
        entity.reward = repoJson.reward ? new BigNumber(repoJson.reward) : entity.reward;
        entity.txHash = repoJson.tx_hash ?? entity.txHash;
        entity.maintenanceFee = repoJson.maintenance_fee ? new BigNumber(repoJson.maintenance_fee) : entity.maintenanceFee;
        entity.cudoPartOfMaintenanceFee = repoJson.cudo_part_of_maintenance_fee ? new BigNumber(repoJson.cudo_part_of_maintenance_fee) : entity.cudoPartOfMaintenanceFee;
        entity.createdAt = repoJson.createdAt?.getTime() ?? entity.createdAt;
        entity.updatedAt = repoJson.updatedAt?.getTime() ?? entity.updatedAt;

        return entity;
    }
}
