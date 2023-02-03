import KycEntity from '../entities/kyc.entity';
import { KycJsonValidator } from '../kyc.types';

export class ResFetchKyc {

    kycEntity: KycJsonValidator;

    constructor(kycEntity: KycEntity) {
        this.kycEntity = KycEntity.toJson(kycEntity);
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

export class ResCreditCheck {

    kycEntity: KycJsonValidator;

    constructor(kycEntity: KycEntity) {
        this.kycEntity = KycEntity.toJson(kycEntity);
    }

}
