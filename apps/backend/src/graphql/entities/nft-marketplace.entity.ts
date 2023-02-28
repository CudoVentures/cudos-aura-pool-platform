import BigNumber from 'bignumber.js';
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

export class ChainMarketplaceNftEntity {
    tokenId: string;
    denomId: string;
    acudosPrice: BigNumber;
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
        this.acudosPrice = new BigNumber(NOT_EXISTS_INT)
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

    hasPrice(): boolean {
        // in graphql price is 0 when the nft is not listed
        return this.acudosPrice.gt(new BigNumber(0));
    }

    hasMarketplaceNftId(): boolean {
        return this.marketplaceNftId !== NOT_EXISTS_INT;
    }

    static fromGraphQl(queryNft: GraphQlMarketplaceNft): ChainMarketplaceNftEntity {
        const nftEntity = new ChainMarketplaceNftEntity();

        nftEntity.tokenId = (queryNft.token_id ?? nftEntity.tokenId).toString();
        nftEntity.denomId = queryNft.denom_id ?? nftEntity.denomId;
        nftEntity.acudosPrice = new BigNumber(queryNft.price ?? nftEntity.acudosPrice);
        nftEntity.uid = queryNft.uid ?? nftEntity.uid;
        nftEntity.marketplaceNftId = parseInt(queryNft.id ?? nftEntity.marketplaceNftId.toString());
        nftEntity.owner = queryNft.nft_nft.owner ?? nftEntity.owner;
        nftEntity.sender = queryNft.nft_nft.sender ?? nftEntity.sender;
        nftEntity.uri = queryNft.nft_nft.uri ?? nftEntity.uri;
        nftEntity.transactionHash = queryNft.nft_nft.transaction_hash ?? nftEntity.transactionHash;
        nftEntity.name = queryNft.nft_nft.name ?? nftEntity.name;
        nftEntity.burned = queryNft.nft_nft.burned ?? nftEntity.burned;
        nftEntity.data = queryNft.nft_nft.data_text ?? nftEntity.data;

        return nftEntity;
    }
}
