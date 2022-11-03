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
            collectionIds: model.collectionIds,
            status: model.status,
            searchString: model.searchString,
            farmId: model.farmId,
            from: model.from,
            count: model.count,
        }
    }

    static fromJson(json): CollectionFilterModel {
        if (json === null) {
            return null;
        }

        const model = new CollectionFilterModel();

        model.collectionIds = json.collectionIds ?? model.collectionIds;
        model.status = json.status ?? model.status;
        model.searchString = json.searchString ?? model.searchString;
        model.farmId = (json.farmId ?? model.farmId).toString();
        model.from = parseInt(json.from ?? model.from);
        model.count = parseInt(json.count ?? model.count);

        return model;
    }

}
