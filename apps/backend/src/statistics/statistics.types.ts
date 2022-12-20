import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { NftTransferHistoryEventType } from './entities/nft-event.entity';

export class NftEventFilterValidationJson {

    @IsNumber()
    @IsOptional()
        sessionAccount: number;

    @IsString()
    @IsOptional()
        nftId: string;

    @IsArray()
    @IsEnum(NftTransferHistoryEventType, { each: true })
    @IsOptional()
        eventTypes: NftTransferHistoryEventType[];

    @IsNumber()
    @IsOptional()
        timestampFrom: number;

    @IsNumber()
    @IsOptional()
        timestampTo: number;

    @IsNumber()
    @IsOptional()
        from: number;

    @IsNumber()
    @IsOptional()
        count: number;
}
