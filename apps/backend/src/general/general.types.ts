import { IsNumber } from 'class-validator';

export class SettingsJsonValidator {
    @IsNumber()
        firstSaleCudosRoyaltiesPercent: number;

    @IsNumber()
        resaleCudosRoyaltiesPercent: number;

    @IsNumber()
        globalCudosFeesPercent: number;

    @IsNumber()
        globalCudosRoyaltiesPercent: number;

}
