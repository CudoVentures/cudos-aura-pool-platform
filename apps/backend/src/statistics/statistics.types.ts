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

export function findIndexInDays(days: number[], timestamp: number) {
    if (days.length === 0) {
        return -1;
    }

    // insert element at the end
    const date = new Date(days[days.length - 1]);
    date.setDate(date.getDate() + 1);
    days.push(date.getTime());

    let l = 0, r = days.length - 1;
    let result = -1;

    while (l <= r) {
        const m = (l + r) >> 1;

        const to = m + 1 < days.length ? days[m + 1] : Number.MAX_SAFE_INTEGER;
        if (days[m] <= timestamp && timestamp < to) {
            result = m;
            break;
        }

        if (timestamp < days[m]) {
            r = m - 1;
        } else {
            l = m + 1;
        }
    }

    return result === days.length - 1 ? -1 : result;
}

export const dayInMs = 24 * 60 * 60 * 1000
