import { AddressMintJsonValidations } from '../nft.types';

export default class AddressMintDataEntity {

    cudosAddress: string;
    firstName: string;
    lastName: string;
    applicantId: string;
    workflowRunId: string;

    constructor() {
        this.cudosAddress = '';
        this.firstName = '';
        this.lastName = '';
        this.applicantId = '';
        this.workflowRunId = '';
    }

    static fromJson(json: AddressMintJsonValidations) {
        if (json === null) {
            return null;
        }

        const entity = new AddressMintDataEntity();

        entity.cudosAddress = json.cudosAddress ?? entity.cudosAddress;
        entity.firstName = json.firstName ?? entity.firstName;
        entity.lastName = json.lastName ?? entity.lastName;
        entity.applicantId = json.applicantId ?? entity.applicantId;
        entity.workflowRunId = json.workflowRunId ?? entity.workflowRunId;

        return entity;
    }
}
