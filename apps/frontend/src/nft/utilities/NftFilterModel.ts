import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';
import { CollectionStatus } from '../../collection/entities/CollectionEntity';
import { NftGroup, NftStatus } from '../entities/NftEntity';
import BigNumber from 'bignumber.js';

export enum NftPriceType {
    USD = 1,
    CUDOS = 2,
}

export enum NftOrderBy {
    TRENDING_ASC = 1,
    TRENDING_DESC = -NftOrderBy.TRENDING_ASC,
    TIMESTAMP_ASC = 2,
    TIMESTAMP_DESC = -NftOrderBy.TIMESTAMP_ASC,
    PRICE_ASC = 3,
    PRICE_DESC = -NftOrderBy.PRICE_ASC,
    HASH_RATE_ASC = 4,
    HASH_RATE_DESC = -NftOrderBy.HASH_RATE_ASC,
    EXPIRY_ASC = 5,
    EXPIRY_DESC = -NftOrderBy.EXPIRY_ASC,
}

export default class NftFilterModel {

    nftIds: string[];
    collectionStatus: CollectionStatus[];
    nftStatus: NftStatus[];
    collectionIds: string[];
    searchString: string;
    sessionAccount: number;
    orderBy: NftOrderBy;
    nftGroup: NftGroup[];
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
        this.collectionStatus = null;
        this.nftStatus = null;
        this.collectionIds = null;
        this.searchString = '';
        this.nftGroup = null;
        this.sessionAccount = S.INT_FALSE;
        this.orderBy = NftOrderBy.TIMESTAMP_DESC;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        // default values so we don't have to check explicitly if they are set
        this.hashRateMin = Number.MIN_SAFE_INTEGER;
        this.hashRateMax = Number.MAX_SAFE_INTEGER;

        this.priceFilterType = NftPriceType.USD;
        this.priceMin = new BigNumber(Number.MIN_SAFE_INTEGER);
        this.priceMax = new BigNumber(Number.MAX_SAFE_INTEGER);

        this.expiryMin = S.NOT_EXISTS;
        this.expiryMax = S.NOT_EXISTS;

        makeAutoObservable(this);
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

    markApprovedCollections() {
        this.collectionStatus = [CollectionStatus.APPROVED];
    }

    resetExpiryMin() {
        this.expiryMin = S.NOT_EXISTS;
    }

    resetExpiryMax() {
        this.expiryMax = S.NOT_EXISTS;
    }

    parseMinHashRate(value: string) {
        const number = parseInt(value)
        this.hashRateMin = Number.isNaN(number) ? Number.MIN_SAFE_INTEGER : number;
    }

    parseMaxHashRate(value: string) {
        const number = parseInt(value)
        this.hashRateMax = Number.isNaN(number) ? Number.MAX_SAFE_INTEGER : number;
    }

    parseMinPrice(value: string) {
        const number = parseInt(value)
        this.priceMin = new BigNumber(Number.isNaN(number) ? Number.MIN_SAFE_INTEGER : value);
    }

    parseMaxPrice(value: string) {
        const number = parseInt(value)
        this.priceMax = new BigNumber(Number.isNaN(number) ? Number.MAX_SAFE_INTEGER : value);
    }

    goToLastPossbilePage(total): boolean {
        const from = Math.floor(total / this.count) * this.count;
        if (from !== this.from) {
            this.from = from;
            return true;
        }

        return false;
    }

    static toJson(entity: NftFilterModel) {
        if (entity === null) {
            return null;
        }

        return {
            'nftIds': entity.nftIds,
            'collectionStatus': entity.collectionStatus,
            'nftStatus': entity.nftStatus,
            'collectionIds': entity.collectionIds,
            'searchString': entity.searchString,
            'nftGroup': entity.nftGroup,
            'sessionAccount': entity.sessionAccount,
            'orderBy': entity.orderBy,
            'from': entity.from,
            'count': entity.count,
            'hashRateMin': entity.hashRateMin,
            'hashRateMax': entity.hashRateMax,
            'priceFilterType': entity.priceFilterType,
            'priceMin': entity.priceMin.toString(),
            'priceMax': entity.priceMax.toString(),
            'expiryMin': entity.expiryMin,
            'expiryMax': entity.expiryMax,
        }
    }
}
