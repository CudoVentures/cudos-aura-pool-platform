import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';

export enum PurchaseTransactionStatus {
    PENDING = 0,
    SUCCESS = 1,
    REFUNDED = 3,
}
export default class PurchaseTransactionEntity {
    txhash: string;
    timestamp: number;
    status: PurchaseTransactionStatus;

    constructor() {
        this.txhash = S.Strings.EMPTY;
        this.timestamp = 0;
        this.status = PurchaseTransactionStatus.PENDING;

        makeAutoObservable(this);
    }

    getTimeFormatted(): string {
        return new Date(this.timestamp).toLocaleString();
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
            'timestamp': entity.timestamp,
            'status': entity.status,
        }
    }

    static fromJson(json: any) {
        if (json === null) {
            return null;
        }

        const entity = new PurchaseTransactionEntity();

        entity.txhash = json.txhash ?? entity.txhash;
        entity.timestamp = json.timestamp ?? entity.timestamp;
        entity.status = json.status ?? entity.status;

        return entity;
    }
}
