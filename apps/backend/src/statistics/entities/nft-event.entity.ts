import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../../common/utils';
import NftMarketplaceTradeHistoryEntity from '../../graphql/entities/nft-marketplace-trade-history.entity';
import NftModuleNftTransferHistoryEntity from '../../graphql/entities/nft-module-nft-transfer-history';

const ZERO_ADDRESS = '0x0';

export enum NftTransferHistoryEventType {
    TRANSFER = 1,
    MINT = 2,
    SALE = 3,
}

export default class NftEventEntity {
    nftId: string;
    denomId: string;
    tokenId: string;
    fromAddress: string;
    toAddress: string;
    timestamp: number;
    eventType: NftTransferHistoryEventType;
    transferPriceInUsd: number;
    transferPriceInBtc: BigNumber;
    transferPriceInAcudos: BigNumber;

    constructor() {
        this.denomId = '';
        this.tokenId = '';
        this.fromAddress = '';
        this.toAddress = '';
        this.timestamp = NOT_EXISTS_INT
        this.eventType = NftTransferHistoryEventType.MINT;
        this.transferPriceInUsd = NOT_EXISTS_INT;
        this.transferPriceInBtc = new BigNumber(NOT_EXISTS_INT);
        this.transferPriceInAcudos = new BigNumber(NOT_EXISTS_INT);
    }

    static fromNftModuleTransferHistory(nftModuleTransferHostoryEntity: NftModuleNftTransferHistoryEntity) {
        const entity = new NftEventEntity();

        entity.eventType = nftModuleTransferHostoryEntity.oldOwner === ZERO_ADDRESS ? NftTransferHistoryEventType.MINT : NftTransferHistoryEventType.TRANSFER;
        entity.denomId = nftModuleTransferHostoryEntity.denomId ?? entity.denomId;
        entity.tokenId = nftModuleTransferHostoryEntity.tokenId ?? entity.tokenId;
        entity.fromAddress = nftModuleTransferHostoryEntity.oldOwner ?? entity.fromAddress;
        entity.toAddress = nftModuleTransferHostoryEntity.newOwner ?? entity.toAddress;
        entity.timestamp = nftModuleTransferHostoryEntity.timestamp ?? entity.timestamp;

        return entity;
    }

    static fromNftMarketplaceTradeHistory(nftMarketplaceTradeHistoryEntity: NftMarketplaceTradeHistoryEntity) {
        const entity = new NftEventEntity();

        console.log(nftMarketplaceTradeHistoryEntity);
        entity.eventType = NftTransferHistoryEventType.SALE;
        entity.denomId = nftMarketplaceTradeHistoryEntity.denomId ?? entity.denomId;
        entity.tokenId = nftMarketplaceTradeHistoryEntity.tokenId ?? entity.tokenId;
        entity.fromAddress = nftMarketplaceTradeHistoryEntity.seller ?? entity.fromAddress;
        entity.toAddress = nftMarketplaceTradeHistoryEntity.buyer ?? entity.toAddress;
        entity.timestamp = nftMarketplaceTradeHistoryEntity.timestamp ?? entity.timestamp;
        entity.transferPriceInBtc = new BigNumber(nftMarketplaceTradeHistoryEntity.btcPrice ?? entity.transferPriceInBtc);
        entity.transferPriceInUsd = nftMarketplaceTradeHistoryEntity.usdPrice ?? entity.transferPriceInUsd;
        entity.transferPriceInAcudos = new BigNumber(nftMarketplaceTradeHistoryEntity.price ?? entity.transferPriceInAcudos);

        return entity;
    }

    static toJson(entity: NftEventEntity): any {
        return {
            'nftId': entity.nftId,
            'denomId': entity.denomId,
            'tokenId': entity.tokenId,
            'fromAddress': entity.fromAddress,
            'toAddress': entity.toAddress,
            'timestamp': entity.timestamp,
            'eventType': entity.eventType,
            'transferPriceInUsd': entity.transferPriceInUsd,
            'transferPriceInBtc': entity.transferPriceInBtc.toString(),
            'transferPriceInAcudos': entity.transferPriceInAcudos.toString(),
        }
    }
}
