import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

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
        id: string;

    @IsString()
        accountId: string;

    @IsString()
        name: string;

    @IsString()
        legalName: string;

    @IsString()
        primaryAccountOwnerName: string;

    @IsString()
        primaryAccountOwnerEmail: string;

    @IsString()
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
        machinesLocation: string

    @IsString()
        profileImgUrl: string;

    @IsString()
        coverImgUrl: string;

    @IsArray()
    @IsString({ each: true })
        farmPhotoUrls: string[];

    @IsEnum(FarmStatus)
        status: FarmStatus;

    @IsString()
        maintenanceFeeInBtc: string;

    // royalties paid to cudos percents
    @IsNumber()
        cudosMintNftRoyaltiesPercent: number;

    @IsNumber()
        cudosResaleNftRoyaltiesPercent: number;

    // ADRESSES
    @IsString()
        resaleFarmRoyaltiesCudosAddress: string;

    @IsString()
        rewardsFromPoolBtcAddress: string;

    @IsString()
        leftoverRewardsBtcAddress: string;

    @IsString()
        maintenanceFeePayoutBtcAddress: string;

}

export class MiningFarmDetailsJsonValidator {

    @IsString()
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

}

export class MiningFarmPerformanceJsonValidator {

    @IsString()
        miningFarmId: string;

    @IsString()
        volumePer24HoursInAcudos: string;

    @IsString()
        volumePer24HoursInUsd: string;

    @IsString()
        floorPriceInAcudos: string;

}

export class EnergySourceJsonValidator {

    @IsString()
        energySourceId: string;

    @IsString()
        name: string;

}

export class MinerJsonValidator {

    @IsString()
        minerId: string;

    @IsString()
        name: string;

}

export class ManufacturerJsonValidator {

    @IsString()
        manufacturerId: string;

    @IsString()
        name: string;

}
