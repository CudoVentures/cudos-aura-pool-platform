import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, DataType } from 'sequelize-typescript';
import { KYC_TABLE_NAME } from '../kyc.types';

export const enum KycRepoColumn {
    KYC_ID = 'kyc_id',
    ACCOUNT_ID = 'account_id',
    APPLICANT_ID = 'applicant_Id',
    ONFIDO_PASSED_1000_CHECK = 'onfido_passed_1000_check',
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
        applicantId: string;

    @AllowNull(false)
    @Column({ type: DataType.TINYINT })
        onfidoPassed1000Check: number

}
