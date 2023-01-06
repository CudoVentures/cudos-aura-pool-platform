import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, DataType } from 'sequelize-typescript';
import { VISITOR_TABLE_NAME } from '../visitor.types';

export const enum VisitorRepoColumn {
    ID = 'id',
    REF_TYPE = 'ref_type',
    REF_ID = 'ref_id',
    VISITOR_UUID = 'visitor_uuid',
    CREATED_AT = 'created_at',
    UPDATED_AT = 'updated_at',
}

@Table({
    freezeTableName: true,
    tableName: VISITOR_TABLE_NAME,
    underscored: true,
})
export default class VisitorRepo extends Model {
    @Unique
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.BIGINT })
        id: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        refType: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING(48) })
        refId: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING(48) })
        visitorUuid: string

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        createdAt: Date;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        updatedAt: Date;

}
