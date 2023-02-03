import { IsArray, IsOptional, IsString } from 'class-validator';

export const KYC_TABLE_NAME = 'kyc'

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

    @IsArray()
    @IsOptional()
        reports: string[][];

    @IsArray()
    @IsOptional()
        checkIds: string[];

    @IsArray()
    @IsOptional()
        checkResults: string[];

}
