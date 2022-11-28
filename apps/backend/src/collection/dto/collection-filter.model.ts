import { IsArray, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { NOT_EXISTS_INT, NOT_EXISTS_STRING } from '../../common/utils';
import { CollectionStatus } from '../utils';

export enum CollectionOrderBy {
    TOP_ASC = 1,
    TOP_DESC = -CollectionOrderBy.TOP_ASC,
    TIMESTAMP_ASC = 2,
    TIMESTAMP_DESC = -CollectionOrderBy.TIMESTAMP_ASC,
}

export default class CollectionFilterModel {

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
        collectionIds: string[];

    @IsEnum(CollectionStatus)
        status: CollectionStatus;

    @IsString()
    @IsOptional()
        searchString: string;

    @IsString()
        farmId: string;

    @IsNumber()
        timestampFrom: number;
    @IsNumber()
        timestampTo: number;

    @IsEnum(CollectionOrderBy)
        orderBy: CollectionOrderBy;

    @IsNumber()
        from: number;

    @IsNumber()
    @IsPositive()
        count: number;

    constructor() {
        this.collectionIds = null;
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

}
