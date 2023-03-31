import { PurchaseTransactionStatus } from '../nft.types';
import { PurchaseTransactionRepo } from '../repos/purchase-transaction.repo';

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

    isPending(): boolean {
        return this.status === PurchaseTransactionStatus.PENDING;
    }

    getStatusString(): string {
        switch (this.status) {
            case PurchaseTransactionStatus.PENDING:
                return 'Pending';
            case PurchaseTransactionStatus.SUCCESS:
                return 'Success';
            case PurchaseTransactionStatus.REFUNDED:
                return 'Refunded';
            default:
                return '';
        }
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

    static fromJson(json: any): PurchaseTransactionEntity {
        if (json === null) {
            return null;
        }

        const entity = new PurchaseTransactionEntity();

        entity.txhash = json.txhash ?? entity.txhash;
        entity.recipientAddress = json.recipientAddress ?? entity.recipientAddress;
        entity.timestamp = json.timestamp ?? entity.timestamp;
        entity.status = json.status ?? entity.status;

        return entity;
    }

    static fromRepo(repoJson: PurchaseTransactionRepo): PurchaseTransactionEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new PurchaseTransactionEntity();

        entity.txhash = repoJson.txHash ?? entity.txhash;
        entity.recipientAddress = repoJson.recipientAddress ?? entity.recipientAddress;
        entity.timestamp = repoJson.timestamp ?? entity.timestamp
        entity.status = repoJson.status ?? entity.status;

        return entity;
    }

    static toRepo(entity: PurchaseTransactionEntity): PurchaseTransactionRepo {
        if (entity === null) {
            return null;
        }

        const repoJson = new PurchaseTransactionRepo();

        repoJson.txHash = entity.txhash ?? repoJson.txHash;
        repoJson.recipientAddress = entity.recipientAddress ?? repoJson.recipientAddress;
        repoJson.timestamp = entity.timestamp ?? repoJson.timestamp;
        repoJson.status = entity.status ?? repoJson.status;

        return repoJson;
    }
}
