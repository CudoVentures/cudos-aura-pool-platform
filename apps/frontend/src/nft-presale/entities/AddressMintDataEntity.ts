import S from '../../core/utilities/Main';
import { NftTier } from '../../nft/entities/NftEntity';

type NftMintData = {
    tier: NftTier,
    count: number
}

export default class AddressMintDataEntity {
    cudosAddress: string;
    firstName: string;
    lastName: string;
    applicantId: string;
    workflowRunId: string;
    nftMints: NftMintData[]

    constructor() {
        this.cudosAddress = S.Strings.EMPTY;
        this.firstName = S.Strings.EMPTY;
        this.lastName = S.Strings.EMPTY;
        this.applicantId = S.Strings.EMPTY;
        this.workflowRunId = S.Strings.EMPTY;
        this.nftMints = [];
    }

    static toJson(entity: AddressMintDataEntity): any {
        return {
            'cudosAddress': entity.cudosAddress,
            'firstName': entity.firstName,
            'lastName': entity.lastName,
            'applicantId': entity.applicantId,
            'workflowRunId': entity.workflowRunId,
        }
    }

    static fromJson(json: any): AddressMintDataEntity {
        if (!json.cudosAddress || !json.firstName || !json.lastName || !json.applicantId || !json.workflowRunId || !json.nftMints) {
            return null;
        }

        const entity = new AddressMintDataEntity();

        entity.cudosAddress = json.cudosAddress ?? entity.cudosAddress;
        entity.firstName = json.firstName ?? entity.firstName;
        entity.lastName = json.lastName ?? entity.lastName;
        entity.applicantId = json.applicantId ?? entity.applicantId;
        entity.workflowRunId = json.workflowRunId ?? entity.workflowRunId;
        entity.nftMints = json.nftMints ?? entity.nftMints;

        return entity;
    }
}
