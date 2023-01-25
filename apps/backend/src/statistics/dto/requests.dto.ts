import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EarningsPerDayFilterJsonValidator, MegaWalletEventFilterValidationJson, NftEventFilterValidationJson } from '../statistics.types'

export class ReqNftEventsByFilter {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => NftEventFilterValidationJson)
        nftEventFilterEntity: NftEventFilterValidationJson;
}

export class ReqMegaWalletEventsByFilter {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => MegaWalletEventFilterValidationJson)
        megaWalletEventFilterEntity: MegaWalletEventFilterValidationJson;
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

export class ReqFetchEarningsPerDay {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => EarningsPerDayFilterJsonValidator)
        earningsPerDayFilterEntity: EarningsPerDayFilterJsonValidator;
}

export class ReqWithMiningFarmId {
    @IsDefined()
    @IsString()
        miningFarmId: string;
}

export class ReqFetchMiningFarmMaintenanceFee extends ReqWithMiningFarmId {
    @IsDefined()
    @IsString()
    @IsOptional()
        collectionId: string;
}

export class ReqFetchMiningFarmTotalBtcEarnings extends ReqWithMiningFarmId {
    @IsDefined()
    @IsString()
    @IsOptional()
        collectionId: string;
}

export class ReqFetchMiningFarmTotalEarningsCudos extends ReqWithMiningFarmId {
    @IsDefined()
    @IsString()
    @IsOptional()
        collectionId: string;
}
