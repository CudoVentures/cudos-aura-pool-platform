import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table } from 'sequelize-typescript';

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
    @Column
        id: number;

    @AllowNull(false)
    @Column
        name: string;

}
