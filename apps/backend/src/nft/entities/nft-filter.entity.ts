import { CollectionStatus } from '../../collection/utils';
import { IntBoolValue } from '../../common/utils';
import { NftFilterJsonValidation, NftOrderBy } from '../nft.types';

export default class NftFilterEntity {
    nftIds: string[];
    tokenIds: string[];
    collectionStatus: CollectionStatus[];
    collectionIds: string[];
    searchString: string;
    sessionAccount: number;
    orderBy: NftOrderBy;
    from: number;
    count: number;

    constructor() {
        this.nftIds = null;
        this.tokenIds = null;
        this.collectionStatus = null;
        this.collectionIds = null;
        this.searchString = '';
        this.sessionAccount = IntBoolValue.FALSE;
        this.orderBy = NftOrderBy.TIMESTAMP_ASC;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;
    }

    hasNftIds(): boolean {
        return this.nftIds !== null;
    }

    hasTokenIds(): boolean {
        return this.nftIds !== null;
    }

    hasCollectionStatus(): boolean {
        return this.collectionStatus !== null && this.collectionStatus.length !== 0;
    }

    hasCollectionIds(): boolean {
        return this.collectionIds !== null;
    }

    hasSearchString(): boolean {
        return this.searchString !== '';
    }

    inOnlyForSessionAccount(): boolean {
        return this.sessionAccount === IntBoolValue.TRUE;
    }

    isSortByTrending() {
        return this.orderBy === NftOrderBy.TRENDING_ASC || this.orderBy === NftOrderBy.TRENDING_DESC;
    }

    getCollectionStatus(): CollectionStatus[] {
        return this.collectionStatus as unknown as CollectionStatus[];
    }

    static fromJson(json: NftFilterJsonValidation): NftFilterEntity {
        const entity = new NftFilterEntity();

        entity.nftIds = json.nftIds ?? entity.nftIds;
        entity.tokenIds = json.tokenIds ?? entity.tokenIds;
        entity.collectionStatus = json.collectionStatus ?? entity.collectionStatus;
        entity.collectionIds = json.collectionIds ?? entity.collectionIds;
        entity.searchString = json.searchString ?? entity.searchString;
        entity.sessionAccount = json.sessionAccount ?? entity.sessionAccount;
        entity.orderBy = json.orderBy ?? entity.orderBy;
        entity.from = json.from ?? entity.from;
        entity.count = json.count ?? entity.count;

        return entity;
    }
}
