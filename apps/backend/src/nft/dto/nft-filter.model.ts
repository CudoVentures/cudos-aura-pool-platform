import { IsString, IsArray, IsEnum, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { CollectionStatus } from '../../collection/utils';
import { IntBoolValue } from '../../common/utils';

export enum NftOrderBy {
    TRENDING_ASC = 1,
    TRENDING_DESC = -NftOrderBy.TRENDING_ASC,
    TIMESTAMP_ASC = 2,
    TIMESTAMP_DESC = -NftOrderBy.TIMESTAMP_ASC,
}

export default class NftFilterModel {

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
        nftIds: string[];

    @IsEnum(CollectionStatus)
        collectionStatus: CollectionStatus;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
        collectionIds: string[];

    @IsString()
    @IsOptional()
        searchString: string;

    @IsEnum(IntBoolValue)
        sessionAccount: number;

    @IsEnum(NftOrderBy)
        orderBy: NftOrderBy;

    @IsNumber()
        from: number;

    @IsNumber()
    @IsPositive()
        count: number;

    constructor() {
        this.nftIds = null;
        this.collectionStatus = CollectionStatus.APPROVED;
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

    hasCollectionStatus(): boolean {
        return this.collectionStatus !== CollectionStatus.ANY;
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

    getCollectionStatus(): CollectionStatus {
        return this.collectionStatus as unknown as CollectionStatus;
    }

}
