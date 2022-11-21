import {
    Column,
    Model,
    AllowNull,
    PrimaryKey,
    Unique,
    DataType,
    AutoIncrement,
    Table,
} from 'sequelize-typescript';

export enum RefType {
    NFT = 1,
    MINING_FARM = 2,
}

export const VISITOR_TABLE_NAME = 'visitors'

@Table({
    freezeTableName: true,
    tableName: VISITOR_TABLE_NAME,
    underscored: true,
})
export class VisitorEntity extends Model {
    @Unique
    @PrimaryKey
    @AutoIncrement
    @Column
        id: number;

    @AllowNull(false)
    @Column
        refType: RefType;

    @AllowNull(false)
    @Column
        refId: string;

    @AllowNull(false)
    @Column
        visitorUuid: string

    @AllowNull(false)
    @Column
        createdAt: Date

    @AllowNull(false)
    @Column
        updatedAt: Date

    static newInstanceForMiningFarm(refId: number, visitorUuid: string): VisitorEntity {
        return VisitorEntity.newInstance(RefType.MINING_FARM, refId.toString(), visitorUuid);
    }

    static newInstanceForNft(refId: string, visitorUuid: string): VisitorEntity {
        return VisitorEntity.newInstance(RefType.NFT, refId, visitorUuid);
    }

    static newInstance(refType: RefType, refId: string, visitorUuid: string): VisitorEntity {
        const entity = new VisitorEntity();

        entity.refType = refType;
        entity.refId = refId;
        entity.visitorUuid = visitorUuid;

        return entity;
    }

}
