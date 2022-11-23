import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table } from 'sequelize-typescript';
import { NOT_EXISTS_INT, NOT_EXISTS_STRING } from '../common/utils';

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

    constructor(...args) {
        super(...args);
        this.id = NOT_EXISTS_INT;
        this.refType = RefType.NFT;
        this.refId = NOT_EXISTS_STRING;
        this.visitorUuid = '';
        this.createdAt = null;
        this.updatedAt = null;
    }

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
