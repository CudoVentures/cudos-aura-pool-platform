import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, DataType } from 'sequelize-typescript';
import { KYC_TABLE_NAME } from '../kyc.types';

export const enum KycRepoColumn {
    KYC_ID = 'kyc_id',
    ACCOUNT_ID = 'account_id',
    FIRST_NAME = 'first_name',
    LAST_NAME = 'last_name',
    APPLICANT_ID = 'applicant_Id',
    REPORTS = 'reports',
    CHECK_IDS = 'check_ids',
    CHECK_RESULTS = 'check_results',
    CHECK_STATUSES = 'check_statuses',
}

@Table({
    freezeTableName: true,
    tableName: KYC_TABLE_NAME,
    underscored: true,
})
export default class KycRepo extends Model {
    @Unique
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        kycId: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        accountId: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        firstName: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        lastName: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        applicantId: string;

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        reports: string[];

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        checkIds: string[];

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        checkResults: string[];

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        checkStatuses: string[];
}
