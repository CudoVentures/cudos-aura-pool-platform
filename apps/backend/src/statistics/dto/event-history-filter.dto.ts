import { IsNumber, IsOptional, IsString } from 'class-validator';

export enum NftEventType {
    TRANSFER = 1,
    MINT = 2,
}

export class NftEventFilterDto {

    @IsNumber()
    @IsOptional()
        sessionAccount: number;

    @IsString()
    @IsOptional()
        nftId: string;

    @IsNumber()
    @IsOptional()
        from: number;

    @IsNumber()
    @IsOptional()
        count: number;
}
