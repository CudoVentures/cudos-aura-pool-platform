import PurchaseTransactionEntity from '../../entities/PurchaseTransactionEntity';

export class ReqUpdateLastCheckedBlocks {
    lastCheckedEthBlock: number;
    lastCheckedCudosBlock: number;

    constructor(lastCheckedEthBlock: number, lastCheckedCudosBlock: number) {
        this.lastCheckedEthBlock = lastCheckedEthBlock
        this.lastCheckedCudosBlock = lastCheckedCudosBlock;
    }
}

export class ReqCreditPurchaseTransactionEntities {
    purcahseTransactionEntitiesJson: any[];

    constructor(purcahseTransactionEntities: PurchaseTransactionEntity[]) {
        this.purcahseTransactionEntitiesJson = purcahseTransactionEntities.map((entity) => PurchaseTransactionEntity.toJson(entity));
    }
}
