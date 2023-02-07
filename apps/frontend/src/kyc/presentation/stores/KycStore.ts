import { makeAutoObservable } from 'mobx';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import KycEntity, { KycStatus } from '../../entities/KycEntity';
import KycRepo from '../repos/KycRepo';

export default class KycStore {

    kycRepo: KycRepo

    kycEntity: KycEntity;

    constructor(kycRepo: KycRepo) {
        this.kycRepo = kycRepo;
        this.kycEntity = null;

        makeAutoObservable(this, {
            kycRepo: false,
        })
    }

    async fetchKyc(): Promise < void > {
        const kycEntity = await this.kycRepo.fetchKyc();

        await runInActionAsync(() => {
            this.kycEntity = kycEntity;
        });
    }

    nullKycOnLogout() {
        this.kycEntity = null;
    }

    isVerificationNotStarted(): boolean {
        return this.kycEntity?.getKycStatus() === KycStatus.NOT_STARTED ?? true;
    }

    isVerificationInProgress(): boolean {
        return this.kycEntity?.getKycStatus() === KycStatus.IN_PROGRESS ?? false;
    }

    isVerificationFailed(): boolean {
        return this.kycEntity?.getKycStatus() === KycStatus.COMPLETED_FAILED ?? false;
    }

    isVerificationSuccessful(): boolean {
        return this.kycEntity?.getKycStatus() === KycStatus.COMPLETED_SUCCESS ?? false;
    }

    getStatusName(): string {
        return KycEntity.getStatusName(this.kycEntity?.getKycStatus() ?? KycStatus.NOT_STARTED);
    }

    async creditKycAndGetToken(): Promise < string > {
        return this.kycRepo.creditKyc(this.kycEntity);
    }

    async createCheck(): Promise < void > {
        return this.kycRepo.createCheck(this.kycEntity);
    }

}
