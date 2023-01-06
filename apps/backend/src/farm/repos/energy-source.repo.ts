import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, DataType } from 'sequelize-typescript';

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
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        id: number;

    @Unique
    @AllowNull(false)
    @Column({ type: DataType.STRING })
        name: string;

}
