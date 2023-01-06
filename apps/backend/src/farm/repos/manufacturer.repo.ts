import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, DataType } from 'sequelize-typescript';

const MANUFACTURER_TABLE_NAME = 'manufacturers';

export const enum ManufacturerRepoColumn {
    ID = 'id',
    NAME = 'name',
}

@Table({
    freezeTableName: true,
    tableName: MANUFACTURER_TABLE_NAME,
    underscored: true,
    timestamps: false,
})
export class ManufacturerRepo extends Model {

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
