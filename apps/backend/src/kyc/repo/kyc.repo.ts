import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, DataType } from 'sequelize-typescript';
import { KYC_TABLE_NAME } from '../kyc.types';

export const enum KycRepoColumn {
    KYC_ID = 'kyc_id',
    ACCOUNT_ID = 'account_id',
    FIRST_NAME = 'first_name',
    LAST_NAME = 'last_name',
    APPLICANT_ID = 'applicant_Id',
    WORKFLOW_IDS = 'workflow_ids',
    WORKFLOW_RUN_IDS = 'workflow_run_ids',
    WORKFLOW_RUN_STATUSES = 'workflow_run_statuses',
    WORKFLOW_RUN_PARAMS = 'workflow_run_params',
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
        workflowIds: string[];

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        workflowRunIds: string[];

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        workflowRunStatuses: string[];

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        workflowRunParams: string[];
}
