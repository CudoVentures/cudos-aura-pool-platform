import PurchaseTransactionEntity from '../../entities/PurchaseTransactionEntity';

export class ReqCreditPurchaseTransactionEntities {
    purchaseTransactionEntitiesJson: any[];

    constructor(purchaseTransactionEntities: PurchaseTransactionEntity[]) {
        this.purchaseTransactionEntitiesJson = purchaseTransactionEntities.map((entity) => PurchaseTransactionEntity.toJson(entity));
    }
}
