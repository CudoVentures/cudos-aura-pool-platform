import { NOT_EXISTS_INT } from '../../common/utils';
import { KycJsonValidator } from '../kyc.types';
import KycRepo from '../repo/kyc.repo';

export default class KycEntity {

    kycId: number;
    accountId: number;
    firstName: string;
    lastName: string;
    applicantId: string;
    reports: string[][];
    checkIds: string[];
    checkResults: string[];
    checkStatuses: string[];

    constructor() {
        this.kycId = NOT_EXISTS_INT;
        this.accountId = NOT_EXISTS_INT;
        this.firstName = '';
        this.lastName = '';
        this.applicantId = '';
        this.reports = [];
        this.checkIds = [];
        this.checkResults = [];
        this.checkStatuses = [];
    }

    static newInstance(accountId: number) {
        const entity = new KycEntity();

        entity.accountId = accountId;

        return entity;
    }

    isNew(): boolean {
        return this.kycId === NOT_EXISTS_INT;
    }

    hasDocumentReport(): boolean {
        const report = this.reports.find((reportNames) => {
            return reportNames.length === 1 && reportNames[0] === 'document';
        });

        return report !== undefined;
    }

    // isVerified(): boolean {
    //     return this.onfidoPassed1000UsdCheck === IntBoolValue.TRUE;
    // }

    hasRegisteredApplicant(): boolean {
        return this.applicantId !== '';
    }

    static toRepo(entity: KycEntity): KycRepo {
        if (entity === null) {
            return null;
        }

        const repoJson = new KycRepo();

        if (entity.kycId !== NOT_EXISTS_INT) {
            repoJson.kycId = entity.kycId;
        }
        repoJson.accountId = entity.accountId ?? repoJson.accountId;
        repoJson.firstName = entity.firstName ?? repoJson.firstName;
        repoJson.lastName = entity.lastName ?? repoJson.lastName;
        repoJson.applicantId = entity.applicantId ?? repoJson.applicantId;
        repoJson.reports = entity.reports?.map((reportsArray) => JSON.stringify(reportsArray)) ?? repoJson.reports;
        repoJson.checkIds = entity.checkIds ?? repoJson.checkIds;
        repoJson.checkResults = entity.checkResults ?? repoJson.checkResults;
        repoJson.checkStatuses = entity.checkStatuses ?? repoJson.checkStatuses;

        return repoJson;
    }

    static fromRepo(repoJson: KycRepo): KycEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new KycEntity();

        repoJson = repoJson.toJSON();
        entity.kycId = repoJson.kycId ?? entity.kycId;
        entity.accountId = repoJson.accountId ?? entity.accountId;
        entity.firstName = repoJson.firstName ?? entity.firstName;
        entity.lastName = repoJson.lastName ?? entity.lastName;
        entity.applicantId = repoJson.applicantId ?? entity.applicantId;
        entity.reports = repoJson.reports?.map((reportsJson) => JSON.parse(reportsJson)) ?? entity.reports;
        entity.checkIds = repoJson.checkIds ?? entity.checkIds;
        entity.checkResults = repoJson.checkResults ?? entity.checkResults;
        entity.checkStatuses = repoJson.checkStatuses ?? entity.checkStatuses;

        return entity;
    }

    static toJson(entity: KycEntity): KycJsonValidator {
        if (entity === null) {
            return null;
        }

        return {
            'kycId': entity.kycId.toString(),
            'accountId': entity.accountId.toString(),
            'applicantId': entity.applicantId,
            'firstName': entity.firstName,
            'lastName': entity.lastName,
            'reports': entity.reports,
            'checkIds': entity.checkIds,
            'checkResults': entity.checkResults,
            'checkStatuses': entity.checkStatuses,
        }
    }

    static fromJson(json: KycJsonValidator): KycEntity {
        if (json === null) {
            return null;
        }

        const entity = new KycEntity();

        entity.kycId = parseInt(json.kycId ?? entity.kycId.toString());
        entity.accountId = parseInt(json.accountId ?? entity.accountId.toString());
        entity.applicantId = (json.applicantId ?? entity.applicantId).toString();
        entity.firstName = (json.firstName ?? entity.firstName).toString();
        entity.lastName = (json.lastName ?? entity.lastName).toString();
        entity.reports = json.reports ?? entity.reports;
        entity.checkIds = json.checkIds ?? entity.checkIds;
        entity.checkResults = json.checkResults ?? entity.checkResults;
        entity.checkStatuses = json.checkStatuses ?? entity.checkStatuses;

        return entity;
    }

}
