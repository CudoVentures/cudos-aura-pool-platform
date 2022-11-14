import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import { CollectionStatus } from '../../collection/entities/CollectionEntity';

export default class NftFilterModel {

    nftIds: string[];
    collectionStatus: CollectionStatus;
    collectionIds: string[];
    searchString: string;
    sessionAccount: number;
    from: number;
    count: number;

    constructor() {
        this.nftIds = null;
        this.collectionStatus = CollectionStatus.APPROVED;
        this.collectionIds = null;
        this.searchString = '';
        this.sessionAccount = S.INT_FALSE;
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
            'status': entity.collectionStatus,
            'collection_ids': entity.collectionIds ? entity.collectionIds.join(',') : null,
            'search_string': entity.searchString,
            'session_account': entity.sessionAccount,
            'offset': entity.from,
            'limit': entity.count,
        }
    }
}
