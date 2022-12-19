import { NOT_EXISTS_INT } from '../../common/utils';
import NftMarketplaceTradeHistoryEntity from '../../graphql/entities/nft-marketplace-trade-history.entity';
import NftModuleNftTransferHistoryEntity from '../../graphql/entities/nft-module-nft-transfer-history';
import { MarketplaceNftTradeHistoryQuery } from '../../graphql/types';

const ZERO_ADDRESS = '0x0';

export enum NftTransferHistoryEventType {
    TRANSFER = 'transfer',
    MINT = 'mint',
    SALE = 'sale',
}

export class NftTransferHistoryEntity {
    nftId: string;
    denomId: string;
    tokenId: string;
    seller: string;
    buyer: string;
    timestamp: number;
    eventType: NftTransferHistoryEventType;
    price: string;
    usdPrice: number;
    btcPrice: string;
    acudosPrice: string;

    constructor() {
        this.denomId = '';
        this.tokenId = '';
        this.seller = '';
        this.buyer = '';
        this.timestamp = NOT_EXISTS_INT
        this.eventType = NftTransferHistoryEventType.MINT;
        this.price = '';
        this.usdPrice = NOT_EXISTS_INT;
        this.btcPrice = '';
        this.acudosPrice = '';
    }

    static fromNftModuleTransferHistory(nftModuleTransferHostoryEntity: NftModuleNftTransferHistoryEntity) {
        const entity = new NftTransferHistoryEntity();

        entity.eventType = nftModuleTransferHostoryEntity.oldOwner === ZERO_ADDRESS ? NftTransferHistoryEventType.TRANSFER : NftTransferHistoryEventType.MINT;
        entity.denomId = nftModuleTransferHostoryEntity.denomId ?? entity.denomId;
        entity.tokenId = nftModuleTransferHostoryEntity.tokenId ?? entity.tokenId;
        entity.seller = nftModuleTransferHostoryEntity.oldOwner ?? entity.seller;
        entity.buyer = nftModuleTransferHostoryEntity.newOwner ?? entity.buyer;
        entity.timestamp = nftModuleTransferHostoryEntity.timestamp ?? entity.timestamp;

        return entity;
    }

    static fromNftMarketplaceTradeHistory(nftMarketplaceTradeHistoryEntity: NftMarketplaceTradeHistoryEntity) {
        const entity = new NftTransferHistoryEntity();

        entity.eventType = nftMarketplaceTradeHistoryEntity.seller === ZERO_ADDRESS ? NftTransferHistoryEventType.SALE : NftTransferHistoryEventType.MINT;
        entity.denomId = nftMarketplaceTradeHistoryEntity.denomId ?? entity.denomId;
        entity.tokenId = nftMarketplaceTradeHistoryEntity.tokenId ?? entity.tokenId;
        entity.seller = nftMarketplaceTradeHistoryEntity.seller ?? entity.seller;
        entity.buyer = nftMarketplaceTradeHistoryEntity.buyer ?? entity.buyer;
        entity.timestamp = nftMarketplaceTradeHistoryEntity.timestamp ?? entity.timestamp;
        entity.btcPrice = nftMarketplaceTradeHistoryEntity.btcPrice ?? entity.btcPrice;
        entity.usdPrice = nftMarketplaceTradeHistoryEntity.usdPrice ?? entity.usdPrice;
        entity.acudosPrice = nftMarketplaceTradeHistoryEntity.price ?? entity.acudosPrice;

        return entity;
    }
}
