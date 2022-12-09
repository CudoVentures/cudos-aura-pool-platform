import { NOT_EXISTS_INT, NOT_EXISTS_STRING } from '../../common/utils';
import { CollectionFilterJsonValidator, CollectionOrderBy } from '../collection.types';
import { CollectionStatus } from '../utils';

export default class CollectionFilterEntity {

    collectionIds: string[];
    denomIds: string[];
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
        this.denomIds = null;
        this.status = CollectionStatus.APPROVED;
        this.searchString = '';
        this.farmId = NOT_EXISTS_STRING;
        this.timestampFrom = NOT_EXISTS_INT;
        this.timestampTo = NOT_EXISTS_INT;
        this.orderBy = 0;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;
    }

    hasCollectionIds(): boolean {
        return this.collectionIds !== null;
    }

    hasCDenomIds(): boolean {
        return this.denomIds !== null;
    }

    hasCollectionStatus(): boolean {
        return this.status !== CollectionStatus.ANY;
    }

    hasSearchString(): boolean {
        return this.searchString !== '';
    }

    hasFarmId(): boolean {
        return this.farmId !== NOT_EXISTS_STRING;
    }

    getCollectionStatus(): CollectionStatus {
        return this.status as unknown as CollectionStatus;
    }

    hasTimestampFrom(): boolean {
        return this.timestampFrom !== NOT_EXISTS_INT;
    }

    hasTimestampTo(): boolean {
        return this.timestampTo !== NOT_EXISTS_INT;
    }

    isSortByTop() {
        return this.orderBy === CollectionOrderBy.TOP_ASC || this.orderBy === CollectionOrderBy.TOP_DESC;
    }

    static fromJson(json: CollectionFilterJsonValidator): CollectionFilterEntity {
        const entity = new CollectionFilterEntity();

        entity.collectionIds = json.collectionIds ?? entity.collectionIds
        entity.denomIds = json.denomIds ?? entity.denomIds
        entity.status = json.status ?? entity.status
        entity.searchString = json.searchString ?? entity.searchString
        entity.farmId = json.farmId ?? entity.farmId
        entity.timestampFrom = json.timestampFrom ?? entity.timestampFrom
        entity.timestampTo = json.timestampTo ?? entity.timestampTo
        entity.orderBy = json.orderBy ?? entity.orderBy
        entity.from = json.from ?? entity.from
        entity.count = json.count ?? entity.count;

        return entity;
    }

}
