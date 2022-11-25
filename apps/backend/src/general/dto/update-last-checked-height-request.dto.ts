import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateLastCheckedBlockRequest {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 1000 })
        height: number;
}
