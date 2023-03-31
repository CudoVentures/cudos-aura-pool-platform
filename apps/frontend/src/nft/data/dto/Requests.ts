import PurchaseTransactionEntity from '../../entities/PurchaseTransactionEntity';
import PurchaseTransactionsFilterModel from '../../entities/PurchaseTransactionsFilterModel';
import NftFilterModel from '../../utilities/NftFilterModel';

export class ReqFetchNftsByFilter {
    nftFilterJson: NftFilterModel;

    constructor(nftFilterModel: NftFilterModel) {
        this.nftFilterJson = NftFilterModel.toJson(nftFilterModel);
    }

}

export class ReqUpdateNftCudosPrice {
    id: string;

    constructor(id: string) {
        this.id = id;
    }
}

export class ReqFetchPurchaseTransactions {
    purchaseTransactionsFilterJson: PurchaseTransactionsFilterModel;
    sessionStoragePurchaseTransactionEntitiesJson: any[];

    constructor(purchaseTransactionsFilterModel: PurchaseTransactionsFilterModel, sessionStoragePurchaseTransactionEntities: PurchaseTransactionEntity[]) {
        this.purchaseTransactionsFilterJson = PurchaseTransactionsFilterModel.toJson(purchaseTransactionsFilterModel);
        this.sessionStoragePurchaseTransactionEntitiesJson = sessionStoragePurchaseTransactionEntities.map((purchaseTransactionEntity) => PurchaseTransactionEntity.toJson(purchaseTransactionEntity));
    }
}
