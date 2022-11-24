import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import { CollectionStatus } from '../entities/CollectionEntity';

export enum CollectionOrderBy {
    TOP_ASC = 1,
    TOP_DESC = -CollectionOrderBy.TOP_ASC,
    TIMESTAMP_ASC = 2,
    TIMESTAMP_DESC = -CollectionOrderBy.TIMESTAMP_ASC,
}

export default class CollectionFilterModel {

    collectionIds: string[];
    status: CollectionStatus;
    searchString: string;
    farmId: string;
    timestampFrom: number;
    timestampTo: number;
    orderBy: CollectionOrderBy;
    from: number;
    count: number;

    constructor() {
        this.collectionIds = null;
        this.status = CollectionStatus.APPROVED;
        this.searchString = '';
        this.farmId = S.Strings.NOT_EXISTS;
        this.timestampFrom = S.NOT_EXISTS;
        this.timestampTo = S.NOT_EXISTS;
        this.orderBy = CollectionOrderBy.TIMESTAMP_ASC;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        makeAutoObservable(this);
    }

    markAnyCollectins() {
        this.status = CollectionStatus.ANY;
    }

    static toJson(model) {
        if (model === null) {
            return null;
        }

        return {
            'collectionIds': model.collectionIds,
            'status': model.status,
            'searchString': model.searchString,
            'farmId': model.farmId,
            'timestampFrom': model.timestampFrom,
            'timestampTo': model.timestampTo,
            'orderBy': model.orderBy,
            'from': model.from,
            'count': model.count,
        }
    }
}
