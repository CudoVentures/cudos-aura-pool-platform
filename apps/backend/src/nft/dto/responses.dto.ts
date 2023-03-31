import NftEntity from '../entities/nft.entity';
import PurchaseTransactionEntity from '../entities/purchase-transaction-entity';
import { NftJsonValidator } from '../nft.types';

export class ResFetchNftsByFilter {
    nftEntities: NftJsonValidator[];
    total: number;

    constructor(nftEntities: NftEntity[], total: number) {
        this.nftEntities = nftEntities.map((entity) => NftEntity.toJson(entity));
        this.total = total;
    }
}

export class ResUpdateNftCudosPrice {
    nftEntity: NftJsonValidator;

    constructor(nftEntity: NftEntity) {
        this.nftEntity = NftEntity.toJson(nftEntity);
    }
}

export class ResFetchPresaleAmounts {
    totalPresaleNftCount: number;
    presaleMintedNftCount: number;

    constructor(totalPresaleNftCount: number, presaleMintedNftCount: number) {
        this.totalPresaleNftCount = totalPresaleNftCount;
        this.presaleMintedNftCount = presaleMintedNftCount;
    }
}

export class ResFetchPurchaseTransactions {
    purchaseTransactionEntities: any[];
    total: number;

    constructor(purchaseTransactionEntities: PurchaseTransactionEntity[], total: number) {
        this.purchaseTransactionEntities = purchaseTransactionEntities.map((entity) => PurchaseTransactionEntity.toJson(entity));
        this.total = total;
    }
}
