import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import sanitizeHtml from 'sanitize-html';

export const KYC_TABLE_NAME = 'kyc'

export enum KycStatus {
    NOT_STARTED = 1,
    IN_PROGRESS = 2,
    COMPLETED_FAILED = 3,
    COMPLETED_SUCCESS = 4,
}

export class KycJsonValidator {

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        kycId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        accountId: string;

    @IsString()
    @IsNotEmpty()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        firstName: string;

    @IsString()
    @IsNotEmpty()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        lastName: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        applicantId: string;

    @IsEnum(KycStatus)
    @IsOptional()
        kycLightStatus: KycStatus;

    @IsEnum(KycStatus)
    @IsOptional()
        kycFullStatus: KycStatus;

}
