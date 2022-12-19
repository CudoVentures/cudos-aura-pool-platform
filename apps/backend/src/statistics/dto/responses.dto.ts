import { TransferHistoryEntity } from '../entities/nft-transfer-history.entity';

export class ResTransferHistory {
    nftEventEntityJsons: TransferHistoryEntity;
    total: number;

    constructor(nftEventEntities: TransferHistoryEntity, total: number) {
        this.nftEventEntityJsons = TransferHistoryEntity.toJson(nftEventEntities);
        this.total = total;
    }
}
