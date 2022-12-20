import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import NftEventFilterEntity from '../entities/nft-event-filter.entity'
import { NftEventFilterValidationJson } from '../statistics.types'

export class ReqNftEventsByFilter {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => NftEventFilterValidationJson)
        nftEventFilterEntity: NftEventFilterValidationJson;
}

export class ReqFetchNftEarningsBySessionAccount {

    @IsNumber()
        timestampFrom: number;

    @IsNumber()
        timestampTo: number;

}

export class ReqFetchNftEarningsByNftId {

    @IsString()
        nftId: string;

    @IsNumber()
        timestampFrom: number;

    @IsNumber()
        timestampTo: number;

}

export class ReqFetchNftEarningsByMiningFarmId {

    @IsString()
        miningFarmId: string;

    @IsNumber()
        timestampFrom: number;

    @IsNumber()
        timestampTo: number;

}
