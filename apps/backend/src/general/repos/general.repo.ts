import {
    Column,
    Model,
    Table,
    AllowNull,
    PrimaryKey,
    Unique,
    AutoIncrement,
    DataType,
} from 'sequelize-typescript';

export const enum GeneralRepoColumn {
    ID = 'id',
    LAST_CHECKED_BLOCK = 'last_checked_block',
    UPDATED_AT = 'updated_at',
}

const GENERAL_TABLE_NAME = 'general';

@Table({
    freezeTableName: true,
    tableName: GENERAL_TABLE_NAME,
    underscored: true,
})
export class GeneralRepo extends Model {
    @Unique
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        id: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        lastCheckedBlock: number;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        updatedAt: Date;
}
