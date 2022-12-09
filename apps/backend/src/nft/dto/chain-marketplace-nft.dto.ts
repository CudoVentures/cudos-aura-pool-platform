import { NOT_EXISTS_INT } from '../../common/utils';

type GraphQlMarketplaceNft = {
    token_id: string,
    price?: string,
    id?: string,
    denom_id: string,
    creator: string,
    transaction_hash: string,
    uid?: string,
    nft_nft: {
        owner: string,
        sender: string,
        uri: string,
        transaction_hash: string,
        name: string,
        id: number,
        denom_id: string,
        burned?: boolean,
        contract_address_signer: string,
        data_text: string
    }
}

export class ChainMarketplaceNftDto {
    tokenId: string;
    denomId: string;
    price: string;
    uid: string;
    owner: string;
    sender: string;
    uri: string;
    transactionHash: string;
    name: string;
    marketplaceNftId: number;
    burned: boolean;
    data: string;

    constructor() {
        this.tokenId = '';
        this.denomId = '';
        this.price = '';
        this.uid = '';
        this.owner = '';
        this.sender = '';
        this.uri = '';
        this.transactionHash = '';
        this.name = '';
        this.data = '';
        this.burned = false;
        this.marketplaceNftId = NOT_EXISTS_INT;
    }

    static fromQuery(queryNft: GraphQlMarketplaceNft): ChainMarketplaceNftDto {
        const nftDto = new ChainMarketplaceNftDto();

        nftDto.tokenId = queryNft.token_id ?? nftDto.tokenId;
        nftDto.denomId = queryNft.denom_id ?? nftDto.denomId;
        nftDto.price = queryNft.price ?? nftDto.price;
        nftDto.uid = queryNft.uid ?? nftDto.uid;
        nftDto.marketplaceNftId = parseInt(queryNft.id) ?? nftDto.marketplaceNftId;
        nftDto.owner = queryNft.nft_nft.owner ?? nftDto.owner;
        nftDto.sender = queryNft.nft_nft.sender ?? nftDto.sender;
        nftDto.uri = queryNft.nft_nft.uri ?? nftDto.uri;
        nftDto.transactionHash = queryNft.nft_nft.transaction_hash ?? nftDto.transactionHash;
        nftDto.name = queryNft.nft_nft.name ?? nftDto.name;
        nftDto.burned = queryNft.nft_nft.burned ?? nftDto.burned;
        nftDto.data = queryNft.nft_nft.data_text ?? nftDto.data;

        return nftDto;
    }
}
