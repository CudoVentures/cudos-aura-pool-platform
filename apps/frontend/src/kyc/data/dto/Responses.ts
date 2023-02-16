import KycEntity from '../../entities/KycEntity';

export class ResFetchKyc {

    kycEntity: KycEntity;
    purchasesInUsdSoFar: number;

    constructor(axiosData: any) {
        this.kycEntity = KycEntity.fromJson(axiosData.kycEntity);
        this.purchasesInUsdSoFar = parseInt(axiosData.purchasesInUsdSoFar);
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

export class ResCreateWorkflowRun {

    kycEntity: KycEntity;
    workflowRunId: string

    constructor(axiosData: any) {
        this.kycEntity = KycEntity.fromJson(axiosData.kycEntity);
        this.workflowRunId = axiosData.workflowRunId;
    }

}
