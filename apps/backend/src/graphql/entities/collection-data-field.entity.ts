import { NOT_EXISTS_STRING } from '../../common/utils';

export default class CollectionDataFieldEntity {
    farmId: string;
    platformRoyaltiesAddress: string;
    farmMintRoyaltiesAddress: string;
    farmResaleRoyaltiesAddress: string;

    constructor() {
        this.farmId = NOT_EXISTS_STRING;
        this.platformRoyaltiesAddress = NOT_EXISTS_STRING;
        this.farmMintRoyaltiesAddress = NOT_EXISTS_STRING;
        this.farmResaleRoyaltiesAddress = NOT_EXISTS_STRING;
    }

    static fromJson(json): CollectionDataFieldEntity {
        const entity = new CollectionDataFieldEntity();

        entity.farmId = json.farm_id ?? entity.farmId;
        entity.platformRoyaltiesAddress = json.platform_royalties_address ?? entity.platformRoyaltiesAddress;
        entity.farmMintRoyaltiesAddress = json.farm_mint_royalties_address ?? entity.farmMintRoyaltiesAddress;
        entity.farmResaleRoyaltiesAddress = json.farm_resale_royalties_address ?? entity.farmResaleRoyaltiesAddress;

        return entity;
    }
}
