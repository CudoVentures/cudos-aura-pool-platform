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
    verified: IntBoolValue;
    creator: string;
    denomId: string;

    constructor() {
        this.mintRoyalties = [];
        this.resaleRoyalties = [];
        this.verified = IntBoolValue.FALSE;
        this.creator = '';
        this.denomId = '';
    }

    static fromQuery(queryCollection: GraphQlCollection): ChainMarketplaceCollectionDto {
        const collectionDto = new ChainMarketplaceCollectionDto();

        collectionDto.verified = parseIntBoolValue(queryCollection.verified ?? collectionDto.verified);
        collectionDto.denomId = queryCollection.denom_id ?? collectionDto.denomId;

        collectionDto.mintRoyalties = queryCollection.mint_royalties
            ? queryCollection.mint_royalties.split(',').map((royaltyString) => {
                console.log(royaltyString)
                const royaltyJson = JSON.parse(royaltyString);
                return Royalty.fromJSON(royaltyJson);
            })
            : collectionDto.mintRoyalties;

        collectionDto.resaleRoyalties = queryCollection.resale_royalties
            ? queryCollection.mint_royalties.split(',').map((royaltyString) => {
                const royaltyJson = JSON.parse(royaltyString);
                return Royalty.fromJSON(royaltyJson);
            })
            : collectionDto.resaleRoyalties;

        return collectionDto;

    }
}
