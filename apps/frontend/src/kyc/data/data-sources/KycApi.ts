import axios from 'axios';
import KycEntity from '../../entities/KycEntity';
import { ReqCreditKyc } from '../dto/Requests';
import { ResCreditCheck, ResCreditKyc, ResFetchKyc } from '../dto/Responses';

const KYC_ENDPOINT = '/api/v1/kyc';

export default class KycApi {

    async fetchKyc(): Promise < KycEntity > {
        const { data } = await axios.post(`${KYC_ENDPOINT}/fetchKyc`);
        const res = new ResFetchKyc(data);
        return res.kycEntity;
    }

    async creditKyc(kycEntity: KycEntity): Promise < { kycEntity: KycEntity, token: string } > {
        const { data } = await axios.post(`${KYC_ENDPOINT}/creditKyc`, new ReqCreditKyc(kycEntity));
        const res = new ResCreditKyc(data);

        return {
            kycEntity: res.kycEntity,
            token: res.token,
        }
    }

    async creditCheck(): Promise < KycEntity > {
        const { data } = await axios.post(`${KYC_ENDPOINT}/creditCheck`);
        const res = new ResCreditCheck(data);
        return res.kycEntity;
    }

}
