import { NOT_EXISTS_INT } from '../../common/utils';

export default class NftModuleNftTransferEntity {
    tokenId: string;
    denomId: string;
    newOwner: string;
    oldOwner: string;
    timestamp: number;
    transactionHash: string;

    constructor() {
        this.tokenId = '';
        this.denomId = '';
        this.newOwner = '';
        this.oldOwner = '';
        this.timestamp = NOT_EXISTS_INT
        this.transactionHash = '';
    }

    static fromGraphQl(json) {
        const entity = new NftModuleNftTransferEntity();

        entity.tokenId = json.id.toString() || entity.tokenId;
        entity.denomId = json.denom_id || entity.denomId;
        entity.newOwner = json.new_owner || entity.newOwner;
        entity.oldOwner = json.old_owner || entity.oldOwner;
        // graphql holds this in seconds, we need it in ms

        entity.timestamp = parseInt(json.timestamp || entity.timestamp.toString()) * 1000;
        entity.transactionHash = json.transaction_hash || entity.transactionHash;

        return entity;
    }
}
