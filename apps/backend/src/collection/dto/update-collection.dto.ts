import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCollectionDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'Collection Name' })
        name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'Collection Name' })
        description: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'Collection Name' })
        denom_id: string;
}
