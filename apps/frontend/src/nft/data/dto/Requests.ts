import PurchaseTransactionEntity from '../../../accounts/entities/PurchaseTransactionEntity';
import PurchaseTransactionsFilterModel from '../../../accounts/entities/PurchaseTransactionsFilterModel';
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
    sessionStoragePurchaseTransactionEntities: any[];

    constructor(purchaseTransactionsFilterModel: PurchaseTransactionsFilterModel, sessionStoragePurchaseTransactionEntities: PurchaseTransactionEntity[]) {
        this.purchaseTransactionsFilterJson = PurchaseTransactionsFilterModel.toJson(purchaseTransactionsFilterModel);
        this.sessionStoragePurchaseTransactionEntities = sessionStoragePurchaseTransactionEntities.map((purchaseTransactionEntity) => PurchaseTransactionEntity.toJson(purchaseTransactionEntity));
    }
}
