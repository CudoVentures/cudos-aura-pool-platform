import { IsArray, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { IntBoolValue } from '../../common/utils';
import { FarmStatus } from '../farm.types';

export enum MiningFarmOrderBy {
    POPULAR_ASC = 1,
    POPULAR_DESC = -MiningFarmOrderBy.POPULAR_ASC,
}

export default class MiningFarmFilterModel {

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
        miningFarmIds: string[];

    @IsArray()
    @IsOptional()
    @IsEnum(FarmStatus, { each: true })
        status: FarmStatus[];

    @IsString()
    @IsOptional()
        searchString: string;

    @IsEnum(IntBoolValue)
        sessionAccount: IntBoolValue;

    @IsEnum(MiningFarmOrderBy)
        orderBy: MiningFarmOrderBy;

    @IsNumber()
        from: number;

    @IsNumber()
    @IsPositive()
        count: number;

    constructor() {
        this.miningFarmIds = null;
        this.status = null;
        this.searchString = '';
        this.sessionAccount = IntBoolValue.FALSE;
        this.orderBy = MiningFarmOrderBy.POPULAR_ASC;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;
    }

    hasMiningFarmIds(): boolean {
        return this.miningFarmIds !== null;
    }

    hasMiningFarmStatus(): boolean {
        return this.status !== null
    }

    hasSearchString(): boolean {
        return this.searchString !== '';
    }

    inOnlyForSessionAccount(): boolean {
        return this.sessionAccount === IntBoolValue.TRUE;
    }

    isSortByPopular() {
        return this.orderBy === MiningFarmOrderBy.POPULAR_ASC || this.orderBy === MiningFarmOrderBy.POPULAR_DESC;
    }

    getMiningFarmStatuses(): FarmStatus[] {
        return this.status as unknown as FarmStatus[];
    }

}
