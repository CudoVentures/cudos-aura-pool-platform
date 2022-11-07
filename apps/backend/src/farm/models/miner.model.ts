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
    tableName: 'miners',
    timestamps: false,
})
export class Miner extends Model {
    @Unique
    @PrimaryKey
    @AutoIncrement
    @Column
        id: number;

    @AllowNull(false)
    @Column
        name: string;
}
