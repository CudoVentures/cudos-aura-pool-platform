import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import { CollectionStatus } from '../../collection/entities/CollectionEntity';

export enum NftOrderBy {
    TRENDING_DESC = 1,
    TIMESTAMP_DESC = 2
}

export default class NftFilterModel {

    nftIds: string[];
    collectionStatus: CollectionStatus;
    collectionIds: string[];
    searchString: string;
    sessionAccount: number;
    orderBy: NftOrderBy;
    from: number;
    count: number;

    constructor() {
        this.nftIds = null;
        this.collectionStatus = CollectionStatus.APPROVED;
        this.collectionIds = null;
        this.searchString = '';
        this.sessionAccount = S.INT_FALSE;
        this.orderBy = 0;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        makeAutoObservable(this);
    }

    static toJson(entity: NftFilterModel) {
        if (entity === null) {
            return null;
        }

        return {
            'ids': entity.nftIds ? entity.nftIds.join(',') : null,
            'collectionStatus': entity.collectionStatus,
            'collection_ids': entity.collectionIds ? entity.collectionIds.join(',') : null,
            'search_string': entity.searchString,
            'session_account': entity.sessionAccount,
            'order_by': entity.orderBy,
            'offset': entity.from,
            'limit': entity.count,
        }
    }
}
