import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table } from 'sequelize-typescript';
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
    @Column
        id: number;

    @AllowNull(false)
    @Column
        refType: number;

    @AllowNull(false)
    @Column
        refId: string;

    @AllowNull(false)
    @Column
        visitorUuid: string

    @AllowNull(false)
    @Column
        createdAt: Date;

    @AllowNull(false)
    @Column
        updatedAt: Date;

}
