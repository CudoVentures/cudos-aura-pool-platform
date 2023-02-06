import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';

export enum KycStatus {
    NOT_STARTED = 1,
    IN_PROGRESS = 2,
    COMPLETED_FAILED = 3,
    COMPLETED_SUCCESS = 4,
}

export default class KycEntity {

    kycId: string;
    accountId: string;
    firstName: string;
    lastName: string;
    applicantId: string;
    reports: string[][];
    checkIds: string[];
    checkResults: string[];
    checkStatuses: string[];

    constructor() {
        this.kycId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.firstName = '';
        this.lastName = '';
        this.applicantId = '';
        this.reports = [];
        this.checkIds = [];
        this.checkResults = [];
        this.checkStatuses = [];

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.kycId === S.Strings.NOT_EXISTS;
    }

    getKycStatus(): KycStatus {
        const lastCheckResult = this.checkResults.last();
        const lastCheckStatus = this.checkStatuses.last();

        if (lastCheckStatus === null) {
            return KycStatus.NOT_STARTED;
        }

        if (lastCheckStatus === 'complete') {
            return lastCheckResult === 'clear' ? KycStatus.COMPLETED_SUCCESS : KycStatus.COMPLETED_FAILED;
        }

        return KycStatus.IN_PROGRESS; // in progress includes in_progress, awaiting_applicant, withdrawn, paused, reopened
    }

    static getStatusName(status): string {
        switch (status) {
            case KycStatus.IN_PROGRESS:
                return 'Verification in progress';
            case KycStatus.COMPLETED_FAILED:
                return 'Verification failed';
            case KycStatus.COMPLETED_SUCCESS:
                return 'Verified';
            case KycStatus.NOT_STARTED:
            default:
                return 'Not verified';
        }
    }

    hasRegisteredApplicant(): boolean {
        return this.applicantId !== '';
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
            'reports': entity.reports,
            'checkIds': entity.checkIds,
            'checkResults': entity.checkResults,
            'checkStatuses': entity.checkStatuses,
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
        entity.reports = json.reports ?? entity.reports;
        entity.checkIds = json.checkIds ?? entity.checkIds;
        entity.checkResults = json.checkResults ?? entity.checkResults;
        entity.checkStatuses = json.checkStatuses ?? entity.checkStatuses;

        return entity;
    }

}
