import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, DataType } from 'sequelize-typescript';

const MINER_TABLE_NAME = 'miners';

export const enum MinerRepoColumn {
    ID = 'id',
    NAME = 'name',
}

@Table({
    freezeTableName: true,
    tableName: MINER_TABLE_NAME,
    underscored: true,
    timestamps: false,
})
export class MinerRepo extends Model {

    @Unique
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        id: number;

    @Unique
    @AllowNull(false)
    @Column({ type: DataType.STRING })
        name: string;

}
