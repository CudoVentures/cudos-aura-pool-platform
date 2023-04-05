import { Transform, TransformFnParams } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import sanitizeHtml from 'sanitize-html';

export enum FarmStatus {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum FarmStatusWithAny {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ANY = 'any',
}

export class MiningFarmJsonValidator {

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        id: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        accountId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        name: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        legalName: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        rewardsFromPoolBtcWalletName: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        primaryAccountOwnerName: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        primaryAccountOwnerEmail: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        description: string;

    @IsArray()
    @IsString({ each: true })
        manufacturerIds: string[];

    @IsArray()
    @IsString({ each: true })
        minerIds: string[];

    @IsArray()
    @IsString({ each: true })
        energySourceIds: string[];

    @IsNumber()
        hashPowerInTh: number;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        machinesLocation: string

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        profileImgUrl: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        coverImgUrl: string;

    @IsArray()
    @IsString({ each: true })
        farmPhotoUrls: string[];

    @IsEnum(FarmStatus)
        status: FarmStatus;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        maintenanceFeeInBtc: string;

    // royalties paid to cudos percents
    @IsNumber()
        cudosMintNftRoyaltiesPercent: number;

    @IsNumber()
        cudosResaleNftRoyaltiesPercent: number;

    // ADRESSES
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        resaleFarmRoyaltiesCudosAddress: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        rewardsFromPoolBtcAddress: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        leftoverRewardsBtcAddress: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        maintenanceFeePayoutBtcAddress: string;

}

export class MiningFarmDetailsJsonValidator {

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        miningFarmId: string;

    @IsNumber()
        averageHashPowerInTh: number;

    @IsNumber()
        activeWorkers: number;

    @IsNumber()
        nftsOwned: number;

    @IsNumber()
        totalNftsSold: number;

    @IsNumber()
        remainingHashPowerInTH: number;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        floorPriceInAcudos: string;

}

export class MiningFarmPerformanceJsonValidator {

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        miningFarmId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        volumePer24HoursInAcudos: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        volumePer24HoursInUsd: number;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        floorPriceInAcudos: string;

}

export class EnergySourceJsonValidator {

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        energySourceId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        name: string;

}

export class MinerJsonValidator {

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        minerId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        name: string;

}

export class ManufacturerJsonValidator {

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        manufacturerId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        name: string;

}
