import { TransferHistoryEntity } from '../entities/transfer-history.entity';

export class ResTransferHistory {
    nftEventEntityJsons: TransferHistoryEntity;
    total: number;

    constructor(nftEventEntities: TransferHistoryEntity, total: number) {
        this.nftEventEntityJsons = TransferHistoryEntity.toJson(nftEventEntities);
        this.total = total;
    }
}
