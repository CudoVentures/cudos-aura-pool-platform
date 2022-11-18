import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import { CollectionStatus } from '../entities/CollectionEntity';

export enum CollectionorderBy {
    TIMESTAMP_DESC = 1,
}

export default class CollectionFilterModel {

    collectionIds: string[];
    status: CollectionStatus;
    searchString: string;
    farmId: string;
    fromTimestamp: number;
    toTimestamp: number;
    orderBy: CollectionorderBy;
    from: number;
    count: number;

    constructor() {
        this.collectionIds = null;
        this.status = CollectionStatus.APPROVED;
        this.searchString = '';
        this.farmId = S.Strings.NOT_EXISTS;
        this.fromTimestamp = 0;
        this.toTimestamp = 0;
        this.orderBy = 0;
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
            'ids': model.collectionIds ? model.collectionIds.join(',') : null,
            'status': model.status,
            'search_string': model.searchString,
            'farm_id': parseInt(model.farmId),
            'from_timestamp': parseInt(model.fromTimestamp),
            'to_timestamp': parseInt(model.toTimestamp),
            'order_by': model.orderBy,
            'offset': model.from,
            'limit': model.count,
        }
    }
}
