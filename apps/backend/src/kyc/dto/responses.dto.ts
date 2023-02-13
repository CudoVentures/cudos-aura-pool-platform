import { IsNumber } from 'class-validator';
import KycEntity from '../entities/kyc.entity';
import { KycJsonValidator } from '../kyc.types';

export class ResFetchKyc {

    kycEntity: KycJsonValidator;

    @IsNumber()
        purchasesInUsdSoFar: number;

    constructor(kycEntity: KycEntity, purchasesInUsdSoFar: number) {
        this.kycEntity = KycEntity.toJson(kycEntity);
        this.purchasesInUsdSoFar = purchasesInUsdSoFar;
    }

}

export class ResCreditKyc {

    token: string;
    kycEntity: KycJsonValidator;

    constructor(token: string, kycEntity: KycEntity) {
        this.token = token;
        this.kycEntity = KycEntity.toJson(kycEntity);
    }

}

export class ResCreateWorkflowRun {

    kycEntity: KycJsonValidator;

    constructor(kycEntity: KycEntity) {
        this.kycEntity = KycEntity.toJson(kycEntity);
    }

}
