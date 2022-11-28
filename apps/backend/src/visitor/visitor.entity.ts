import { NOT_EXISTS_INT, NOT_EXISTS_STRING } from '../common/utils';
import VisitorRepo from './visitor.repo';
import { RefType } from './visitor.types';

export default class VisitorEntity {

    id: number;
    refType: RefType;
    refId: string;
    visitorUuid: string
    createdAt: Date
    updatedAt: Date

    constructor() {
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

    static toRepo(entity: VisitorEntity): VisitorRepo {
        if (entity === null) {
            return null;
        }

        const repoJson = new VisitorRepo();

        if (entity.id !== NOT_EXISTS_INT) {
            repoJson.id = entity.id;
        }
        repoJson.refType = entity.refType ?? repoJson.refType;
        repoJson.refId = entity.refId ?? repoJson.refId;
        repoJson.visitorUuid = entity.visitorUuid ?? repoJson.visitorUuid;

        return repoJson;
    }

    static fromRepo(repoJson: VisitorRepo): VisitorEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new VisitorEntity();

        repoJson = repoJson.toJSON();
        entity.id = repoJson.id ?? entity.id;
        entity.refType = repoJson.refType ?? entity.refType;
        entity.refId = repoJson.refId ?? entity.refId;
        entity.visitorUuid = repoJson.visitorUuid ?? entity.visitorUuid;
        entity.createdAt = repoJson.createdAt ?? entity.createdAt;
        entity.updatedAt = repoJson.updatedAt ?? entity.updatedAt;

        return entity;
    }

}
