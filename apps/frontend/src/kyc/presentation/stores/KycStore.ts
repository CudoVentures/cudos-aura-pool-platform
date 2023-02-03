import { makeAutoObservable, runInAction } from 'mobx';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import KycEntity from '../../entities/KycEntity';
import KycRepo from '../repos/KycRepo';

export default class KycStore {

    kycRepo: KycRepo

    inited: boolean;
    kycEntity: KycEntity;

    constructor(kycRepo: KycRepo) {
        this.kycRepo = kycRepo;
        this.inited = false;
        this.kycEntity = null;

        makeAutoObservable(this, {
            kycRepo: false,
        })
    }

    async init(): Promise < void > {
        if (this.inited === true) {
            return;
        }

        this.inited = true;
        try {
            const kycEntity = await this.kycRepo.fetchKyc();

            await runInActionAsync(() => {
                this.kycEntity = kycEntity;
            });
        } catch (e) {
            runInAction(() => {
                this.inited = false;
            });
            throw e;
        }
    }

    isVerified(): boolean {
        return this.kycEntity?.isVerified() ?? false;
    }

    isVerifycationInProgress(): boolean {
        return this.kycEntity?.isVerifycationInProgress() ?? false;
    }

    isInited(): boolean {
        return this.inited;
    }

    async creditKycAndGetToken(): Promise < string > {
        return this.kycRepo.creditKyc(this.kycEntity);
    }

    async creditCheck(): Promise < void > {
        return this.kycRepo.creditCheck(this.kycEntity);
    }

}
