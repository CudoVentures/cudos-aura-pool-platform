import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../../common/utils';
import { NftOwnersPayoutHistoryRepo } from '../repos/nft-owners-payout-history.repo';

export class NftOwnersPayoutHistoryEntity {

    id: number;
    timeOwnedFrom: number;
    timeOwnedTo: number;
    totalTimeOwned: number;
    percentOfTimeOwned: number;
    owner: string;
    payoutAddress: string;
    reward: BigNumber;
    nftPayoutHistoryId: number
    createdAt: number;
    updatedAt: number;
    sent: boolean

    constructor() {
        this.id = NOT_EXISTS_INT;
        this.timeOwnedFrom = NOT_EXISTS_INT;
        this.timeOwnedTo = NOT_EXISTS_INT;
        this.totalTimeOwned = NOT_EXISTS_INT;
        this.percentOfTimeOwned = NOT_EXISTS_INT;
        this.owner = '';
        this.payoutAddress = '';
        this.reward = null;
        this.createdAt = NOT_EXISTS_INT;
        this.updatedAt = NOT_EXISTS_INT;
        this.sent = false;
    }

    // isNew(): boolean {
    //     return this.id === NOT_EXISTS_INT;
    // }

    static toRepo(entity: NftOwnersPayoutHistoryEntity): NftOwnersPayoutHistoryRepo {
        throw Error('CUDOS Markets platform must not write to this table');
        // if (entity === null) {
        //     return null;
        // }

        // const repoJson = new NftOwnersPayoutHistoryRepo();
        // if (entity.isNew() === false) {
        //     repoJson.id = entity.id;
        // }

        // return repoJson;
    }

    static fromRepo(repoJson: NftOwnersPayoutHistoryRepo): NftOwnersPayoutHistoryEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new NftOwnersPayoutHistoryEntity();

        entity.id = repoJson.id ?? entity.id;
        entity.timeOwnedFrom = repoJson.time_owned_from ?? entity.timeOwnedFrom;
        entity.timeOwnedTo = repoJson.time_owned_to ?? entity.timeOwnedTo;
        entity.totalTimeOwned = repoJson.total_time_owned ?? entity.totalTimeOwned;
        entity.percentOfTimeOwned = repoJson.percent_of_time_owned ?? entity.percentOfTimeOwned;
        entity.owner = repoJson.owner ?? entity.owner;
        entity.payoutAddress = repoJson.payout_address ?? entity.payoutAddress;
        entity.reward = repoJson.reward ? new BigNumber(repoJson.reward) : entity.reward;
        entity.nftPayoutHistoryId = repoJson.nft_payout_history_id ?? entity.nftPayoutHistoryId;
        entity.createdAt = repoJson.createdAt?.getTime() ?? entity.createdAt;
        entity.updatedAt = repoJson.updatedAt?.getTime() ?? entity.updatedAt;
        entity.sent = repoJson.sent ?? entity.sent;

        return entity;
    }
}
