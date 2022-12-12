import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import { CollectionStatus } from '../../collection/entities/CollectionEntity';

export enum NftOrderBy {
    TRENDING_ASC = 1,
    TRENDING_DESC = -NftOrderBy.TRENDING_ASC,
    TIMESTAMP_ASC = 2,
    TIMESTAMP_DESC = -NftOrderBy.TIMESTAMP_ASC,
}

export default class NftFilterModel {

    nftIds: string[];
    collectionStatus: CollectionStatus[];
    collectionIds: string[];
    searchString: string;
    sessionAccount: number;
    orderBy: NftOrderBy;
    from: number;
    count: number;

    constructor() {
        this.nftIds = null;
        this.collectionStatus = null;
        this.collectionIds = null;
        this.searchString = '';
        this.sessionAccount = S.INT_FALSE;
        this.orderBy = NftOrderBy.TIMESTAMP_DESC;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        makeAutoObservable(this);
    }

    static toJson(entity: NftFilterModel) {
        if (entity === null) {
            return null;
        }

        return {
            'nftIds': entity.nftIds,
            'collectionStatus': entity.collectionStatus,
            'collectionIds': entity.collectionIds,
            'searchString': entity.searchString,
            'sessionAccount': entity.sessionAccount,
            'orderBy': entity.orderBy,
            'from': entity.from,
            'count': entity.count,
        }
    }
}
