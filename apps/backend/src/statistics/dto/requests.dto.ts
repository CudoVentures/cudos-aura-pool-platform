import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { MegaWalletEventFilterValidationJson, NftEventFilterValidationJson } from '../statistics.types'

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

export class ReqFetchNftEarningsByMiningFarmId {

    @IsString()
        miningFarmId: string;

    @IsNumber()
        timestampFrom: number;

    @IsNumber()
        timestampTo: number;

}

export class ReqFetchTotalNftEarnings {

    @IsNumber()
        timestampFrom: number;

    @IsNumber()
        timestampTo: number;

}
