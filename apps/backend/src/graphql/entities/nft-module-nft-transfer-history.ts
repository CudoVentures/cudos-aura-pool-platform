import { NOT_EXISTS_INT } from '../../common/utils';

export default class NftModuleNftTransferHistoryEntity {
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
        const entity = new NftModuleNftTransferHistoryEntity();

        entity.tokenId = json.id || entity.tokenId;
        entity.denomId = json.denomId || entity.denomId;
        entity.newOwner = json.newOwner || entity.newOwner;
        entity.oldOwner = json.oldOwner || entity.oldOwner;
        entity.timestamp = parseInt(json.timestamp || entity.timestamp.toString());
        entity.transactionHash = json.transactionHash || entity.transactionHash;

        return entity;
    }
}
