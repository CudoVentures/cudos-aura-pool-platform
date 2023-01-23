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
        data_json?: {
            farm_id: string,
            platform_royalties_address: string,
            farm_mint_royalties_address: string,
            farm_resale_royalties_address: string
        }
    },
}

export enum RoyaltiesType {
    MINT = 'mint',
    RESALE = 'resale',
}

export enum RoyaltiesReceiver {
    PLATFORM = 'platform',
    FARM = 'farm'
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

    getMintRoyaltiesPercent(address: string): number {
        const percentString = this.mintRoyalties.find((royalty: Royalty) => royalty.address === address)?.percent;
        return Number(percentString ?? 0);
    }

    getResaleRoyaltiesPercent(address: string): number {
        const percentString = this.resaleRoyalties.find((royalty: Royalty) => royalty.address === address)?.percent;
        return Number(percentString ?? 0);
    }

    static fromGraphQl(queryCollection: GraphQlCollection): ChainMarketplaceCollectionEntity {
        const entity = new ChainMarketplaceCollectionEntity();

        entity.verified = queryCollection.verified ?? entity.verified;
        entity.denomId = queryCollection.denom_id ?? entity.denomId;
        entity.mintRoyalties = JSON.parse(queryCollection.mint_royalties).map((royaltyJson) => Royalty.fromJSON(royaltyJson))
        entity.resaleRoyalties = JSON.parse(queryCollection.resale_royalties).map((royaltyJson) => Royalty.fromJSON(royaltyJson))

        const dataJson = queryCollection.nft_denom.data_json;

        entity.farmId = dataJson?.farm_id ?? entity.farmId;
        entity.platformRoyaltiesAddress = dataJson?.platform_royalties_address ?? entity.platformRoyaltiesAddress;
        entity.farmMintRoyaltiesAddress = dataJson?.farm_mint_royalties_address ?? entity.farmMintRoyaltiesAddress;
        entity.farmResaleRoyaltiesAddress = dataJson?.farm_resale_royalties_address ?? entity.farmResaleRoyaltiesAddress;

        return entity;

    }
}
