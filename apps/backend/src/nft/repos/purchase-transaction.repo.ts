import {
    Column,
    Model,
    Table,
    PrimaryKey,
    Unique,
    AllowNull,
    DataType,
} from 'sequelize-typescript';
import { PurchaseTransactionStatus } from '../nft.types';

const PURCAHSE_TRANSACTIONS_TABLE_NAME = 'purchase_transactions'

export const enum PurchaseTransactionsRepoColumn {
    TX_HASH = 'tx_hash',
    RECIPIENT_ADDRESS = 'recipient_address',
    TIMESTAMP = 'timestamp',
    STATUS = 'status'
}

@Table({
    freezeTableName: true,
    tableName: PURCAHSE_TRANSACTIONS_TABLE_NAME,
    underscored: true,
})
export class PurchaseTransactionRepo extends Model {
    @Unique
    @PrimaryKey
    @AllowNull(false)
    @Column({ type: DataType.STRING })
        txHash: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        recipientAddress: string;

    @AllowNull(false)
    @Column({ type: DataType.NUMBER })
        timestamp: number;

    @AllowNull(false)
    @Column({ type: DataType.ENUM(PurchaseTransactionStatus.PENDING, PurchaseTransactionStatus.REFUNDED, PurchaseTransactionStatus.SUCCESS) })
        status: PurchaseTransactionStatus;
}
