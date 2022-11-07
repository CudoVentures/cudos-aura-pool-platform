import {
    Column,
    Model,
    Table,
    AllowNull,
    PrimaryKey,
    Unique,
    AutoIncrement,
} from 'sequelize-typescript';

@Table({
    freezeTableName: true,
    tableName: 'energy_sources',
    timestamps: false,
})
export class EnergySource extends Model {
    @Unique
    @PrimaryKey
    @AutoIncrement
    @Column
        id: number;

    @AllowNull(false)
    @Column
        name: string;
}
