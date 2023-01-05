import { Royalty } from 'cudosjs/build/stargate/modules/marketplace/proto-types/royalty';

type GraphQlCollection = {
    mint_royalties: string,
    resale_royalties: string,
    verified: boolean,
    creator: string,
    denom_id: string,
    id: any,
    transaction_hash: string,
    nft_denom: {
        data_text?: string
    },
}

export default class ChainMarketplaceCollectionEntity {
    mintRoyalties: Royalty[];
    resaleRoyalties: Royalty[];
    verified: boolean;
    creator: string;
    denomId: string;
    farmId: string;
    platformRoyaltiesAddress: string;
    farmMintRoyaltiesAddress: string;
    farmResaleRoyaltiesAddress: string;

    constructor() {
        this.mintRoyalties = [];
        this.resaleRoyalties = [];
        this.verified = false;
        this.creator = '';
        this.denomId = '';
        this.farmId = '';
        this.platformRoyaltiesAddress = '';
        this.farmMintRoyaltiesAddress = '';
        this.farmResaleRoyaltiesAddress = '';
    }

    static fromGraphQl(queryCollection: GraphQlCollection): ChainMarketplaceCollectionEntity {
        const entity = new ChainMarketplaceCollectionEntity();

        entity.verified = queryCollection.verified ?? entity.verified;
        entity.denomId = queryCollection.denom_id ?? entity.denomId;
        entity.mintRoyalties = JSON.parse(queryCollection.mint_royalties).map((royaltyJson) => Royalty.fromJSON(royaltyJson))
        entity.resaleRoyalties = JSON.parse(queryCollection.resale_royalties).map((royaltyJson) => Royalty.fromJSON(royaltyJson))

        const dataJson = JSON.parse(queryCollection.nft_denom.data_text);
        entity.farmId = dataJson.farm_id ?? entity.farmId;
        entity.platformRoyaltiesAddress = dataJson.platform_royalties_address ?? entity.platformRoyaltiesAddress;
        entity.farmMintRoyaltiesAddress = dataJson.farm_mint_royalties_address ?? entity.farmMintRoyaltiesAddress;
        entity.farmResaleRoyaltiesAddress = dataJson.farm_resale_royalties_address ?? entity.farmResaleRoyaltiesAddress;

        return entity;

    }
}
