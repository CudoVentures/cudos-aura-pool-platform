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
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 1000 })
        height: number;
}

export class ReqUpdateLastCheckedPaymentRelayerBlocksRequest {
    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 1000 })
        lastCheckedEthBlock: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 1000 })
        lastCheckedCudosBlock: number;
}
