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
