import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, DataType, Validate } from 'sequelize-typescript';

const ACCOUNT_TABLE_NAME = 'accounts'

export const enum AccountRepoColumn {
    ID = 'account_id',
    TYPE = 'type',
    ACTIVE = 'active',
    EMAIL_VERIFIED = 'email_verified',
    NAME = 'name',
    EMAIL = 'email',
    TIMESTAMP_LAST_LOGIN = 'last_login_at',
    CREATED_AT = 'created_at',
    UPDATED_AT = 'updated_at',
}

@Table({
    freezeTableName: true,
    tableName: ACCOUNT_TABLE_NAME,
    underscored: true,
})
export default class AccountRepo extends Model {

    @Unique
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        accountId: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        type: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        active: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        emailVerified: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        name: string;

    @AllowNull(true)
    @Unique
    @Column({ type: DataType.STRING })
        email: string;

    @AllowNull(true)
    @Column({ type: DataType.DATE })
        lastLoginAt: Date;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        createdAt: Date;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        updatedAt: Date;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        salt: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        hashedPass: string;

}
