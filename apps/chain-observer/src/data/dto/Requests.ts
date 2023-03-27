import PurchaseTransactionEntity from '../../entities/PurchaseTransactionEntity';

export class ReqCreditPurchaseTransactionEntities {
    purcahseTransactionEntitiesJson: any[];

    constructor(purcahseTransactionEntities: PurchaseTransactionEntity[]) {
        this.purcahseTransactionEntitiesJson = purcahseTransactionEntities.map((entity) => PurchaseTransactionEntity.toJson(entity));
    }
}
