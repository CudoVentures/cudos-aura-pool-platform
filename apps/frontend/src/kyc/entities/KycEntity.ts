import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';

export enum KycStatus {
    NOT_STARTED = 1,
    IN_PROGRESS = 2,
    COMPLETED_FAILED = 3,
    COMPLETED_SUCCESS = 4,
}

export enum KycStatusWithPartial {
    NOT_STARTED = 1,
    IN_PROGRESS = 2,
    COMPLETED_FAILED = 3,
    COMPLETED_SUCCESS = 4,
    PARTIAL = 5,
}

export const LIGHT_PARAMS_LIMIT_IN_USD = 1000;

export default class KycEntity {

    kycId: string;
    accountId: string;
    firstName: string;
    lastName: string;
    applicantId: string;
    kycLightStatus: KycStatus;
    kycFullStatus: KycStatus;

    constructor() {
        this.kycId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.firstName = '';
        this.lastName = '';
        this.applicantId = '';
        this.kycLightStatus = KycStatus.NOT_STARTED;
        this.kycFullStatus = KycStatus.NOT_STARTED;

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.kycId === S.Strings.NOT_EXISTS;
    }

    static getStatusName(status): string {
        switch (status) {
            case KycStatus.IN_PROGRESS:
                return 'Verification in progress';
            case KycStatus.COMPLETED_FAILED:
                return 'Verification failed';
            case KycStatus.COMPLETED_SUCCESS:
                return 'Completely Verified';
            case KycStatusWithPartial.PARTIAL:
                return 'Partially Verified';
            case KycStatus.NOT_STARTED:
            default:
                return 'Not verified';
        }
    }

    hasRegisteredApplicant(): boolean {
        return this.applicantId !== '';
    }

    isLightStatusNotStarted(): boolean {
        return this.kycLightStatus === KycStatus.NOT_STARTED;
    }

    isLightStatusInProgress(): boolean {
        return this.kycLightStatus === KycStatus.IN_PROGRESS;
    }

    isLightStatusCompletedFailed(): boolean {
        return this.kycLightStatus === KycStatus.COMPLETED_FAILED;
    }

    isLightStatusCompletedSuccess(): boolean {
        return this.kycLightStatus === KycStatus.COMPLETED_SUCCESS;
    }

    isFullStatusNotStarted(): boolean {
        return this.kycFullStatus === KycStatus.NOT_STARTED;
    }

    isFullStatusInProgress(): boolean {
        return this.kycFullStatus === KycStatus.IN_PROGRESS;
    }

    isFullStatusCompletedFailed(): boolean {
        return this.kycFullStatus === KycStatus.COMPLETED_FAILED;
    }

    isFullStatusCompletedSuccess(): boolean {
        return this.kycFullStatus === KycStatus.COMPLETED_SUCCESS;
    }

    static toJson(entity: KycEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'kycId': entity.kycId,
            'accountId': entity.accountId,
            'firstName': entity.firstName,
            'lastName': entity.lastName,
            'applicantId': entity.applicantId,
            'kycLightStatus': entity.kycLightStatus,
            'kycFullStatus': entity.kycFullStatus,
        }
    }

    static fromJson(json): KycEntity {
        if (json === null) {
            return null;
        }

        const entity = new KycEntity();

        entity.kycId = (json.kycId ?? entity.kycId).toString();
        entity.accountId = (json.accountId ?? entity.accountId).toString();
        entity.firstName = json.firstName ?? entity.firstName;
        entity.lastName = json.lastName ?? entity.lastName;
        entity.applicantId = (json.applicantId ?? entity.applicantId).toString();
        entity.kycLightStatus = parseInt(json.kycLightStatus ?? entity.kycLightStatus);
        entity.kycFullStatus = parseInt(json.kycFullStatus ?? entity.kycFullStatus);

        return entity;
    }

}
