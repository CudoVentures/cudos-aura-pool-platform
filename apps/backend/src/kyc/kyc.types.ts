import { IsEnum, IsOptional, IsString } from 'class-validator';

export const KYC_TABLE_NAME = 'kyc'

export enum KycStatus {
    NOT_STARTED = 1,
    IN_PROGRESS = 2,
    COMPLETED_FAILED = 3,
    COMPLETED_SUCCESS = 4,
}

export class KycJsonValidator {

    @IsString()
    @IsOptional()
        kycId: string;

    @IsString()
    @IsOptional()
        accountId: string;

    @IsString()
        firstName: string;

    @IsString()
        lastName: string;

    @IsString()
    @IsOptional()
        applicantId: string;

    @IsEnum(KycStatus)
    @IsOptional()
        kycLightStatus: KycStatus;

    @IsEnum(KycStatus)
    @IsOptional()
        kycFullStatus: KycStatus;

}
