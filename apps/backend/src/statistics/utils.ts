import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class EarningsFilters {
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        timestampFrom: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        timestampTo: number;
}

export const getDays = (start, end) => {
    const date = new Date(start);

    const dates = [];

    while (date <= new Date(end)) {
        dates.push(new Date(date).getTime());
        date.setDate(date.getDate() + 1);
    }

    return dates;
};

export const dayInMs = 24 * 60 * 60 * 1000
