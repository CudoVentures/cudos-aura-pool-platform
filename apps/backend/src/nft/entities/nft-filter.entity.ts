import BigNumber from 'bignumber.js';
import { CollectionStatus } from '../../collection/utils';
import { IntBoolValue, NOT_EXISTS_INT } from '../../common/utils';
import { NftFilterJsonValidation, NftGroup, NftOrderBy, NftPriceType, NftStatus } from '../nft.types';

export default class NftFilterEntity {
    nftIds: string[];
    tokenIds: string[];
    collectionStatus: CollectionStatus[];
    nftStatus: NftStatus[];
    collectionIds: string[];
    nftGroup: NftGroup[];
    searchString: string;
    sessionAccount: number;
    orderBy: NftOrderBy;
    from: number;
    count: number;

    hashRateMin: number;
    hashRateMax: number;

    priceFilterType: NftPriceType;
    priceMin: BigNumber;
    priceMax: BigNumber;

    expiryMin: number;
    expiryMax: number;

    constructor() {
        this.nftIds = null;
        this.tokenIds = null;
        this.collectionStatus = null;
        this.nftStatus = null;
        this.nftGroup = null;
        this.collectionIds = null;
        this.searchString = '';
        this.sessionAccount = IntBoolValue.FALSE;
        this.orderBy = NftOrderBy.TIMESTAMP_ASC;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        // default values so we don't have to check explicitly if they are set
        this.hashRateMin = Number.MIN_SAFE_INTEGER;
        this.hashRateMax = Number.MAX_SAFE_INTEGER;

        this.priceFilterType = NftPriceType.USD;
        this.priceMin = new BigNumber(Number.MIN_SAFE_INTEGER);
        this.priceMax = new BigNumber(Number.MAX_SAFE_INTEGER);

        this.expiryMin = NOT_EXISTS_INT;
        this.expiryMax = NOT_EXISTS_INT;
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

    hasNftStatus(): boolean {
        return this.nftStatus !== null && this.nftStatus.length !== 0;
    }

    hasNftGroup(): boolean {
        return this.nftGroup !== null && this.nftGroup.length !== 0;
    }

    hasCollectionIds(): boolean {
        return this.collectionIds !== null;
    }

    hasSearchString(): boolean {
        return this.searchString !== '';
    }

    hasHashRateMin(): boolean {
        return this.hashRateMin !== Number.MIN_SAFE_INTEGER;
    }

    hasHashRateMax(): boolean {
        return this.hashRateMax !== Number.MAX_SAFE_INTEGER;
    }

    hasPriceMin(): boolean {
        return this.priceMin.eq(new BigNumber(Number.MIN_SAFE_INTEGER)) === false;
    }

    hasPriceMax(): boolean {
        return this.priceMax.eq(new BigNumber(Number.MAX_SAFE_INTEGER)) === false;
    }

    hasExpiryMin(): boolean {
        return this.expiryMin !== NOT_EXISTS_INT;
    }

    hasExpiryMax(): boolean {
        return this.expiryMax !== NOT_EXISTS_INT;
    }

    inOnlyForSessionAccount(): boolean {
        return this.sessionAccount === IntBoolValue.TRUE;
    }

    isSortByTrending() {
        return this.orderBy === NftOrderBy.TRENDING_ASC || this.orderBy === NftOrderBy.TRENDING_DESC;
    }

    isPriceFilterTypeCudos(): boolean {
        return this.priceFilterType === NftPriceType.CUDOS;
    }

    getCollectionStatus(): CollectionStatus[] {
        return this.collectionStatus as unknown as CollectionStatus[];
    }

    static fromJson(json: NftFilterJsonValidation): NftFilterEntity {
        const entity = new NftFilterEntity();

        entity.nftIds = json.nftIds ?? entity.nftIds;
        entity.tokenIds = json.tokenIds ?? entity.tokenIds;
        entity.collectionStatus = json.collectionStatus ?? entity.collectionStatus;
        entity.nftStatus = json.nftStatus ?? entity.nftStatus;
        entity.nftGroup = json.nftGroup ?? entity.nftGroup;
        entity.collectionIds = json.collectionIds ?? entity.collectionIds;
        entity.searchString = json.searchString ?? entity.searchString;
        entity.sessionAccount = json.sessionAccount ?? entity.sessionAccount;
        entity.orderBy = json.orderBy ?? entity.orderBy;
        entity.from = json.from ?? entity.from;
        entity.count = json.count ?? entity.count;

        entity.hashRateMin = json.hashRateMin ?? entity.hashRateMin;
        entity.hashRateMax = json.hashRateMax ?? entity.hashRateMax;

        entity.priceFilterType = json.priceFilterType ?? entity.priceFilterType;
        entity.priceMin = new BigNumber(json.priceMin ?? entity.priceMin);
        entity.priceMax = new BigNumber(json.priceMax ?? entity.priceMax);

        entity.expiryMin = json.expiryMin ?? entity.expiryMin;
        entity.expiryMax = json.expiryMax ?? entity.expiryMax;

        return entity;
    }
}
