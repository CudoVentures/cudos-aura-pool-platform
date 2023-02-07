import KycEntity from '../../entities/KycEntity';

export class ReqCreditKyc {

    kycEntity: KycEntity;

    constructor(kycEntity: KycEntity) {
        this.kycEntity = KycEntity.toJson(kycEntity);
    }

}
