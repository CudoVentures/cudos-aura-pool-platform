import { NOT_EXISTS_INT } from '../../common/utils';

export default class NftMarketplaceTradeHistoryEntity {
    buyer: string;
    btcPrice: string;
    denomId: string;
    price: string;
    seller: string;
    timestamp: number;
    tokenId: string;
    usdPrice: number;
    transactionHash: string;

    constructor() {
        this.buyer = '';
        this.btcPrice = '';
        this.denomId = '';
        this.price = '';
        this.seller = '';
        this.timestamp = NOT_EXISTS_INT;
        this.tokenId = '';
        this.usdPrice = NOT_EXISTS_INT;
        this.transactionHash = '';
    }

    static fromGraphQl(json) {
        const entity = new NftMarketplaceTradeHistoryEntity();

        entity.buyer = json.buyer || entity.buyer;
        entity.btcPrice = json.btc_price || entity.btcPrice;
        entity.denomId = json.denom_id || entity.denomId;
        entity.price = json.price || entity.price;
        entity.seller = json.seller || entity.seller;
        // graphql holds this in seconds, we need it in ms
        entity.timestamp = parseInt(json.timestamp || entity.timestamp.toString()) * 1000;
        entity.tokenId = json.token_id?.toString() || entity.tokenId;
        entity.usdPrice = parseInt(json.usd_price || entity.usdPrice.toString());
        entity.transactionHash = json.transaction_hash || entity.transactionHash;

        return entity;
    }
}
