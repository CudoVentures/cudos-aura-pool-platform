import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import { CollectionStatus } from '../entities/CollectionEntity';

export default class CollectionFilterModel {

    collectionIds: string[];
    status: CollectionStatus;
    searchString: string;
    farmId: string;
    from: number;
    count: number;

    constructor() {
        this.collectionIds = null;
        this.status = CollectionStatus.APPROVED;
        this.searchString = '';
        this.farmId = S.Strings.NOT_EXISTS;
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
            'ids': model.collectionIds,
            'status': model.status,
            'search_string': model.searchString,
            'farm_id': parseInt(model.farmId),
            'offset': model.from,
            'limit': model.count,
        }
    }
}
