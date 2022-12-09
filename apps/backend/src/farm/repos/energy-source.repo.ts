import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table } from 'sequelize-typescript';

const ENERGY_SOURCE_TABLE_NAME = 'energy_sources';

export const enum EnergySourceRepoColumn {
    ID = 'id',
    NAME = 'name',
}

@Table({
    freezeTableName: true,
    tableName: ENERGY_SOURCE_TABLE_NAME,
    underscored: true,
    timestamps: false,
})
export class EnergySourceRepo extends Model {

    @Unique
    @PrimaryKey
    @AutoIncrement
    @Column
        id: number;

    @AllowNull(false)
    @Column
        name: string;

}
