import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';

export default class KycEntity {

    kycId: string;
    accountId: string;
    firstName: string;
    lastName: string;
    applicantId: string;
    reports: string[][];
    checkIds: string[];
    checkResults: string[];

    constructor() {
        this.kycId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.firstName = '';
        this.lastName = '';
        this.applicantId = '';
        this.reports = [];
        this.checkIds = [];
        this.checkResults = [];

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.kycId === S.Strings.NOT_EXISTS;
    }

    isVerified(): boolean {
        const lastCheckResult = this.checkResults.last();
        return lastCheckResult !== null && lastCheckResult === 'clear';
    }

    isVerifycationInProgress(): boolean {
        const lastCheckResult = this.checkResults.last();
        return lastCheckResult !== null && lastCheckResult !== 'clear';
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

        return entity;
    }

}
