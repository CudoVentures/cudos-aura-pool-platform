import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EarningsPerDayCurrency } from './entities/earnings-per-day-filter.entity';
import { MegaWalletEventSortBy } from './entities/mega-wallet-event-filter.entity';
import { NftTransferHistoryEventType } from './entities/nft-event.entity';
import sanitizeHtml from 'sanitize-html';
import { Transform, TransformFnParams } from 'class-transformer';

export class EarningsPerDayFilterJsonValidator {
    @IsNumber()
    @IsOptional()
        timestampFrom: number;

    @IsNumber()
    @IsOptional()
        timestampTo: number;

    @IsEnum(EarningsPerDayCurrency)
        currency: EarningsPerDayCurrency;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        farmId: string

    @IsString({ each: true })
    @IsOptional()
    @IsArray()
        collectionIds: string[]
}

export class NftEventFilterValidationJson {

    @IsNumber()
    @IsOptional()
        sessionAccount: number;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        nftId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        miningFarmId: string;

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

    @IsEnum(MegaWalletEventSortBy)
    @IsOptional()
        sortBy: MegaWalletEventSortBy;
}

export function getDays(start, end) {
    const pointer = new Date(start);
    const dates = [];

    while (pointer.getTime() < end) {
        dates.push(pointer.getTime());
        pointer.setDate(pointer.getDate() + 1);
    }

    return dates;
}

export const dayInMs = 24 * 60 * 60 * 1000
