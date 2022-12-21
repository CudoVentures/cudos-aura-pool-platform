import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MegaWalletEventType } from './entities/mega-wallet-event.entity';
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

export class MegaWalletEventFilterValidationJson {

    @IsArray()
    @IsEnum(MegaWalletEventType, { each: true })
    @IsOptional()
        eventTypes: MegaWalletEventType[];

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
