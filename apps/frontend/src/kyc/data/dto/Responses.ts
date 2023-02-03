import KycEntity from '../../entities/KycEntity';

export class ResFetchKyc {

    kycEntity: KycEntity;

    constructor(axiosData: any) {
        this.kycEntity = KycEntity.fromJson(axiosData.kycEntity);
    }

}

export class ResCreditKyc {

    token: string;
    kycEntity: KycEntity;

    constructor(axiosData: any) {
        this.token = axiosData.token;
        this.kycEntity = KycEntity.fromJson(axiosData.kycEntity);
    }

}

export class ResCreditCheck {

    kycEntity: KycEntity;

    constructor(axiosData: any) {
        this.kycEntity = KycEntity.fromJson(axiosData.kycEntity);
    }

}
