import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EarningsPerDayCurrency } from './entities/earnings-per-day-filter.entity';
import { MegaWalletEventType } from './entities/mega-wallet-event.entity';
import { NftTransferHistoryEventType } from './entities/nft-event.entity';

export class EarningsPerDayFilterJsonValidator {
    @IsNumber()
    @IsOptional()
        timestampFrom: number;

    @IsNumber()
    @IsOptional()
        timestampTo: number;

    @IsNumber()
    @IsEnum(EarningsPerDayCurrency)
        currency: EarningsPerDayCurrency;

    @IsString()
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
    @IsOptional()
        nftId: string;

    @IsString()
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
