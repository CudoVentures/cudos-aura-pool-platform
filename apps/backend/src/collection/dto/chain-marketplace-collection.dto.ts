import { Royalty } from 'cudosjs/build/stargate/modules/marketplace/proto-types/royalty';
import { IntBoolValue, parseIntBoolValue } from '../../common/utils';

type GraphQlCollection = {
    mint_royalties: string,
    resale_royalties: string,
    verified: boolean,
    creator: string,
    denom_id: string,
    id: any,
    transaction_hash: string
}

export class ChainMarketplaceCollectionDto {
    mintRoyalties: Royalty[];
    resaleRoyalties: Royalty[];
    verified: boolean;
    creator: string;
    denomId: string;

    constructor() {
        this.mintRoyalties = [];
        this.resaleRoyalties = [];
        this.verified = false;
        this.creator = '';
        this.denomId = '';
    }

    static fromQuery(queryCollection: GraphQlCollection): ChainMarketplaceCollectionDto {
        const collectionDto = new ChainMarketplaceCollectionDto();
        collectionDto.verified = queryCollection.verified ?? collectionDto.verified;
        collectionDto.denomId = queryCollection.denom_id ?? collectionDto.denomId;

        collectionDto.mintRoyalties = JSON.parse(queryCollection.mint_royalties).map((royaltyJson) => Royalty.fromJSON(royaltyJson))

        collectionDto.resaleRoyalties = JSON.parse(queryCollection.resale_royalties).map((royaltyJson) => Royalty.fromJSON(royaltyJson))

        return collectionDto;

    }
}
