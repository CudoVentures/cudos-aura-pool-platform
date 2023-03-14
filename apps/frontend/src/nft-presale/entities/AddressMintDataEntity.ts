import S from '../../core/utilities/Main';
import { NftTier } from '../../nft/entities/NftEntity';

type NftMintData = {
    tier: NftTier,
    count: number
}

export default class AddressMintDataEntity {
    cudosAddress: string;
    btcAddress: string;
    firstName: string;
    lastName: string;
    applicantId: string;
    workflowRunId: string;
    nftMints: NftMintData[]

    constructor() {
        this.cudosAddress = S.Strings.EMPTY;
        this.btcAddress = S.Strings.EMPTY;
        this.firstName = S.Strings.EMPTY;
        this.lastName = S.Strings.EMPTY;
        this.applicantId = S.Strings.EMPTY;
        this.workflowRunId = S.Strings.EMPTY;
        this.nftMints = [];
    }

    hasAccountData(): boolean {
        return this.cudosAddress !== '' && this.firstName !== '' && this.lastName !== '' && this.applicantId !== '' && this.workflowRunId !== '';
    }

    static toJson(entity: AddressMintDataEntity): any {
        return {
            'cudosAddress': entity.cudosAddress,
            'btcAddress': entity.btcAddress,
            'firstName': entity.firstName,
            'lastName': entity.lastName,
            'applicantId': entity.applicantId,
            'workflowRunId': entity.workflowRunId,
        }
    }

    static fromJson(json: any): AddressMintDataEntity {
        if (typeof (json) !== 'object') {
            throw Error(`Invalid JSON ${JSON.stringify(json)}`);
        }
        if (typeof (json.cudosAddress) !== 'string') {
            throw Error(`Missing cudosAddress. Invalid JSON ${JSON.stringify(json)}`);
        }
        if (typeof (json.btcAddress) !== 'string') {
            throw Error(`Missing btcAddress. Invalid JSON ${JSON.stringify(json)}`);
        }
        if (typeof (json.firstName) !== 'string') {
            throw Error(`Missing firstName. Invalid JSON ${JSON.stringify(json)}`);
        }
        if (typeof (json.lastName) !== 'string') {
            throw Error(`Missing lastName. Invalid JSON ${JSON.stringify(json)}`);
        }
        if (typeof (json.applicantId) !== 'string') {
            throw Error(`Missing applicantId. Invalid JSON ${JSON.stringify(json)}`);
        }
        if (typeof (json.workflowRunId) !== 'string') {
            throw Error(`Missing workflowRunId. Invalid JSON ${JSON.stringify(json)}`);
        }
        if (typeof (json.nftMints) !== 'object' || typeof (json.nftMints.length) !== 'number') {
            throw Error(`Missing nftMints. Invalid JSON ${JSON.stringify(json)}`);
        }

        const entity = new AddressMintDataEntity();

        entity.cudosAddress = json.cudosAddress ?? entity.cudosAddress;
        entity.btcAddress = json.btcAddress ?? entity.btcAddress;
        entity.firstName = json.firstName ?? entity.firstName;
        entity.lastName = json.lastName ?? entity.lastName;
        entity.applicantId = json.applicantId ?? entity.applicantId;
        entity.workflowRunId = json.workflowRunId ?? entity.workflowRunId;
        entity.nftMints = json.nftMints ?? entity.nftMints;

        return entity;
    }
}
