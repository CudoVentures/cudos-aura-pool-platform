import { IsNumber, Min } from 'class-validator';

export class SettingsJsonValidator {
    @IsNumber()
    @Min(0)
        firstSaleCudosRoyaltiesPercent: number;

    @IsNumber()
    @Min(0)
        resaleCudosRoyaltiesPercent: number;

    @IsNumber()
    @Min(0)
        globalCudosFeesPercent: number;

    @IsNumber()
    @Min(0)
        globalCudosRoyaltiesPercent: number;

}
