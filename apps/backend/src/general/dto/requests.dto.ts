import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator';
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
        height: number;
}

export class ReqUpdateLastCheckedPaymentRelayerBlocksRequest {
    @IsNumber()
    @IsOptional()
        lastCheckedEthBlock: number;

    @IsNumber()
    @IsOptional()
        lastCheckedCudosBlock: number;
}
