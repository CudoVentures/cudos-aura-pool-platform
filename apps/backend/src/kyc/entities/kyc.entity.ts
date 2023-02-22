import { NOT_EXISTS_INT } from '../../common/utils';
import { KycJsonValidator, KycStatus } from '../kyc.types';
import KycRepo from '../repo/kyc.repo';
import { WorkflowRunParamsEntity, WorkflowRunParamsV1Entity, WorkflowRunParamsVxEntity } from './workflow-run-params.entity';

export default class KycEntity {

    kycId: number;
    accountId: number;
    firstName: string;
    lastName: string;
    applicantId: string;
    workflowIds: string[];
    workflowRunIds: string[];
    workflowRunStatuses: string[];
    workflowRunParams: WorkflowRunParamsEntity < WorkflowRunParamsVxEntity >[];

    constructor() {
        this.kycId = NOT_EXISTS_INT;
        this.accountId = NOT_EXISTS_INT;
        this.firstName = '';
        this.lastName = '';
        this.applicantId = '';
        this.workflowIds = [];
        this.workflowRunIds = [];
        this.workflowRunStatuses = [];
        this.workflowRunParams = [];
    }

    static newInstance(accountId: number) {
        const entity = new KycEntity();

        entity.accountId = accountId;

        return entity;
    }

    isNew(): boolean {
        return this.kycId === NOT_EXISTS_INT;
    }

    isLightVerified(): boolean {
        return this.getKycLightStatus() === KycStatus.COMPLETED_SUCCESS;
    }

    isFullVerified(): boolean {
        return this.getKycFullStatus() === KycStatus.COMPLETED_SUCCESS;
    }

    hasRegisteredApplicant(): boolean {
        return this.applicantId !== '';
    }

    hasWorkflowRunWithFullParams(): boolean {
        const lastFullI = this.getLastFullWorkflowRunIndex();
        return lastFullI !== NOT_EXISTS_INT;
    }

    getLatestWorkflowRunId(): string {
        if (this.workflowRunIds.length === 0) {
            return null;
        }

        return this.workflowRunIds[this.workflowRunIds.length - 1];
    }

    getRunningWorkflowRunIds(): string[] {
        return this.workflowRunIds.filter((workflowRunId, i) => {
            const status = this.workflowRunStatuses[i];
            return status === 'processing' || status === 'awaiting_input';
        });
    }

    getLastLightWorkflowRunIndex(): number {
        for (let i = this.workflowRunParams.length; i-- > 0;) {
            const workflowRunParams = this.workflowRunParams[i];
            if (workflowRunParams.params instanceof WorkflowRunParamsV1Entity) {
                const unwrappedParams = workflowRunParams.unwrap() as WorkflowRunParamsV1Entity;
                if (unwrappedParams.areLightParams() === true) {
                    return i;
                }
            }
        }

        return NOT_EXISTS_INT
    }

    getLastFullWorkflowRunIndex(): number {
        for (let i = this.workflowRunParams.length; i-- > 0;) {
            const workflowRunParams = this.workflowRunParams[i];
            if (workflowRunParams.params instanceof WorkflowRunParamsV1Entity) {
                const unwrappedParams = workflowRunParams.unwrap() as WorkflowRunParamsV1Entity;
                if (unwrappedParams.areFullParams() === true) {
                    return i;
                }
            }
        }

        return NOT_EXISTS_INT
    }

    getKycLightStatus(): KycStatus {
        const lastLightI = this.getLastLightWorkflowRunIndex();

        if (lastLightI === NOT_EXISTS_INT) {
            return KycStatus.NOT_STARTED;
        }

        const lastWorkflowRunStatus = this.workflowRunStatuses[lastLightI];
        switch (lastWorkflowRunStatus) {
            case 'processing':
            case 'awaiting_input':
                return KycStatus.IN_PROGRESS;
            case 'approved':
                return KycStatus.COMPLETED_SUCCESS;
            case 'abandoned':
            case 'error':
            case 'review':
            case 'declined':
            default:
                return KycStatus.COMPLETED_FAILED;
        }
    }

    getKycFullStatus(): KycStatus {
        const lastFullI = this.getLastFullWorkflowRunIndex();

        if (lastFullI === NOT_EXISTS_INT) {
            return KycStatus.NOT_STARTED;
        }

        const lastWorkflowRunStatus = this.workflowRunStatuses[lastFullI];
        switch (lastWorkflowRunStatus) {
            case 'processing':
            case 'awaiting_input':
                return KycStatus.IN_PROGRESS;
            case 'approved':
                return KycStatus.COMPLETED_SUCCESS;
            case 'abandoned':
            case 'error':
            case 'review':
            case 'declined':
            default:
                return KycStatus.COMPLETED_FAILED;
        }
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
        repoJson.workflowIds = entity.workflowIds ?? repoJson.workflowIds;
        repoJson.workflowRunIds = entity.workflowRunIds ?? repoJson.workflowRunIds;
        repoJson.workflowRunStatuses = entity.workflowRunStatuses ?? repoJson.workflowRunStatuses;
        repoJson.workflowRunParams = entity.workflowRunParams?.map((paramsObj) => JSON.stringify(WorkflowRunParamsEntity.toJson(paramsObj))) ?? repoJson.workflowRunParams;

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
        entity.workflowIds = repoJson.workflowIds ?? entity.workflowIds;
        entity.workflowRunIds = repoJson.workflowRunIds ?? entity.workflowRunIds;
        entity.workflowRunStatuses = repoJson.workflowRunStatuses ?? entity.workflowRunStatuses;
        entity.workflowRunParams = repoJson.workflowRunParams?.map((paramsJson) => WorkflowRunParamsEntity.fromJson(JSON.parse(paramsJson))) ?? entity.workflowRunParams;

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
            'kycLightStatus': entity.getKycLightStatus(),
            'kycFullStatus': entity.getKycFullStatus(),
        }
    }

    // Nothing is read from the frontend
    // static fromJson(json: KycJsonValidator): KycEntity {
    //     if (json === null) {
    //         return null;
    //     }

    //     const entity = new KycEntity();

    //     entity.kycId = parseInt(json.kycId ?? entity.kycId.toString());
    //     entity.accountId = parseInt(json.accountId ?? entity.accountId.toString());
    //     entity.applicantId = (json.applicantId ?? entity.applicantId).toString();
    //     entity.firstName = (json.firstName ?? entity.firstName).toString();
    //     entity.lastName = (json.lastName ?? entity.lastName).toString();

    //     return entity;
    // }

}
