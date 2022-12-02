type GraphQlMarketplaceNft = {
    token_id: string,
    price?: string,
    id?: string,
    denom_id: string,
    creator: string,
    transaction_hash: string,
    uid?: string,
}

export class ChainMarketplaceNftDto {
    tokenId: string;
    price: string;
    uid: string;

    constructor() {
        this.tokenId = '';
        this.price = '';
        this.uid = '';
    }

    static fromQuery(queryNft: GraphQlMarketplaceNft): ChainMarketplaceNftDto {
        const nftDto = new ChainMarketplaceNftDto();
        nftDto.tokenId = queryNft.token_id ?? nftDto.tokenId;
        nftDto.price = queryNft.price ?? nftDto.price;
        nftDto.uid = queryNft.uid ?? nftDto.uid;
        return nftDto;

    }
}
