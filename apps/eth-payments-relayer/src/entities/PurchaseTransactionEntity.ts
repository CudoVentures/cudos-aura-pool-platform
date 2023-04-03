export enum PurchaseTransactionStatus {
    PENDING = '1',
    SUCCESS = '2',
    REFUNDED = '3',
}
export default class PurchaseTransactionEntity {
    txhash: string;
    recipientAddress: string;
    timestamp: number;
    status: PurchaseTransactionStatus;

    constructor() {
        this.txhash = '';
        this.recipientAddress = '';
        this.timestamp = 0;
        this.status = PurchaseTransactionStatus.PENDING;
    }

    static toJson(entity: PurchaseTransactionEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'txhash': entity.txhash,
            'recipientAddress': entity.recipientAddress,
            'timestamp': entity.timestamp,
            'status': entity.status,
        }
    }
}
