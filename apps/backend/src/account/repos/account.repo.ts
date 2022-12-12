import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table } from 'sequelize-typescript';

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
    @Column
        accountId: number;

    @AllowNull(false)
    @Column
        type: number;

    @AllowNull(false)
    @Column
        active: number;

    @AllowNull(false)
    @Column
        emailVerified: number;

    @AllowNull(false)
    @Column
        name: string;

    @AllowNull(true)
    @Unique
    @Column
        email: string;

    @AllowNull(true)
    @Column
        lastLoginAt: Date;

    @AllowNull(false)
    @Column
        createdAt: Date;

    @AllowNull(false)
    @Column
        updatedAt: Date;

    @AllowNull(false)
    @Column
        salt: string;

    @AllowNull(false)
    @Column
        hashedPass: string;

}
