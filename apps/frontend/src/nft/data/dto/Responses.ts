import PurchaseTransactionEntity from '../../entities/PurchaseTransactionEntity';
import NftEntity from '../../entities/NftEntity'

export class ResFetchNftsByFilter {
    nftEntities: NftEntity[];
    total: number;

    constructor(data) {
        this.nftEntities = data.nftEntities.map((json) => NftEntity.fromJson(json));
        this.total = data.total;
    }
}

export class ResUpdateNftCudosPrice {
    nftEntity: NftEntity;

    constructor(data) {
        this.nftEntity = NftEntity.fromJson(data.nftEntity);
    }
}

export class ResFetchPresaleAmounts {
    totalPresaleNftCount: number;
    presaleMintedNftCount: number;

    constructor(data) {
        this.totalPresaleNftCount = parseInt(data.totalPresaleNftCount);
        this.presaleMintedNftCount = parseInt(data.presaleMintedNftCount);
    }
}

export class ResFetchPurchaseTransactions {
    purchaseTransactionEntities: PurchaseTransactionEntity[];
    total: number;

    constructor(data) {
        this.purchaseTransactionEntities = data.purchaseTransactionEntities.map((json) => PurchaseTransactionEntity.fromJson(json));
        this.total = data.total;
    }
}
