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
    tableName: 'manufacturers',
    timestamps: false,
})
export class Manufacturer extends Model {
    @Unique
    @PrimaryKey
    @AutoIncrement
    @Column
        id: number;

    @AllowNull(false)
    @Column
        name: string;
}
