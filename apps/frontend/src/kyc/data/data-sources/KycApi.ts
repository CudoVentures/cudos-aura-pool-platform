import axios from 'axios';
import KycEntity from '../../entities/KycEntity';
import { ReqCreateWorkflowRun, ReqCreditKyc } from '../dto/Requests';
import { ResCreateWorkflowRun, ResCreditKyc, ResFetchKyc } from '../dto/Responses';

const KYC_ENDPOINT = '/api/v1/kyc';

export default class KycApi {

    async fetchKyc(): Promise < { kycEntity: KycEntity, purchasesInUsdSoFar: number } > {
        const { data } = await axios.post(`${KYC_ENDPOINT}/fetchKyc`);
        const res = new ResFetchKyc(data);
        return {
            kycEntity: res.kycEntity,
            purchasesInUsdSoFar: res.purchasesInUsdSoFar,
        }
    }

    async creditKyc(kycEntity: KycEntity): Promise < { kycEntity: KycEntity, token: string } > {
        const { data } = await axios.post(`${KYC_ENDPOINT}/creditKyc`, new ReqCreditKyc(kycEntity));
        const res = new ResCreditKyc(data);

        return {
            kycEntity: res.kycEntity,
            token: res.token,
        }
    }

    async createWorkflowRun(runFullWorkflow: number): Promise < KycEntity > {
        const { data } = await axios.post(`${KYC_ENDPOINT}/createWorkflowRun`, new ReqCreateWorkflowRun(runFullWorkflow));
        const res = new ResCreateWorkflowRun(data);
        return res.kycEntity;
    }

}
