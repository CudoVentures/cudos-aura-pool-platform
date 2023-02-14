import { makeAutoObservable } from 'mobx';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import KycEntity, { KycStatusWithPartial } from '../../entities/KycEntity';
import KycRepo from '../repos/KycRepo';

export default class KycStore {

    kycRepo: KycRepo

    kycEntity: KycEntity;
    purchasesInUsdSoFar: number;

    constructor(kycRepo: KycRepo) {
        this.kycRepo = kycRepo;
        this.kycEntity = null;

        makeAutoObservable(this, {
            kycRepo: false,
        })
    }

    async fetchKyc(): Promise < void > {
        const { kycEntity, purchasesInUsdSoFar } = await this.kycRepo.fetchKyc();

        await runInActionAsync(() => {
            this.kycEntity = kycEntity;
            this.purchasesInUsdSoFar = purchasesInUsdSoFar;
        });
    }

    nullKycOnLogout() {
        this.kycEntity = null;
        this.purchasesInUsdSoFar = 0;
    }

    isAnyVerificationNotStarted(): boolean {
        if (this.kycEntity === null) {
            return true;
        }

        return this.kycEntity.isLightStatusNotStarted() && this.kycEntity.isFullStatusNotStarted();
    }

    canBuyAnNft(nftPriceInUsd): boolean {
        if (this.kycEntity === null) {
            return false;
        }

        if (this.kycEntity.isFullStatusCompletedSuccess() === true) {
            return true;
        }

        if (this.kycEntity.isLightStatusCompletedSuccess() === true) {
            return nftPriceInUsd + this.purchasesInUsdSoFar <= 1000;
        }

        return false;
    }

    getBadgeStatus(): KycStatusWithPartial {
        let status = KycStatusWithPartial.NOT_STARTED;

        if (this.kycEntity !== null) {
            if (this.kycEntity.isFullStatusNotStarted() === true) {
                status = this.kycEntity.isLightStatusCompletedSuccess() === true ? KycStatusWithPartial.PARTIAL : (this.kycEntity.kycLightStatus as unknown as KycStatusWithPartial);
            } else {
                status = this.kycEntity.kycFullStatus as unknown as KycStatusWithPartial;
            }
        }

        return status;
    }

    async creditKycAndGetToken(): Promise < string > {
        return this.kycRepo.creditKyc(this.kycEntity);
    }

    async createWorkflowRun(runFullWorkflow: number): Promise < void > {
        return this.kycRepo.createWorkflowRun(this.kycEntity, runFullWorkflow);
    }

}
