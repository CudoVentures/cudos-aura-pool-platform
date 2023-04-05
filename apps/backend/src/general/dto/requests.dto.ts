import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { SettingsJsonValidator } from '../general.types';

export class ReqCreditSettings {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => SettingsJsonValidator)
        settingsEntity: SettingsJsonValidator;

}

export class ReqUpdateLastCheckedBlockRequest {
    @IsNumber()
    @IsPositive()
        height: number;
}

export class ReqUpdateLastCheckedPaymentRelayerBlocksRequest {
    @IsNumber()
    @IsPositive()
    @IsOptional()
        lastCheckedEthBlock: number;

    @IsNumber()
    @IsPositive()
    @IsOptional()
        lastCheckedCudosBlock: number;
}
