import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../../common/utils';
import NftMarketplaceTradeHistoryEntity from '../../graphql/entities/nft-marketplace-trade-history.entity';
import NftModuleNftTransferHistoryEntity from '../../graphql/entities/nft-module-nft-transfer-history';
import NftEventEntity from './nft-event.entity';

const ZERO_ADDRESS = '0x0';

export enum MegaWalletEventType {
    TRANSFER = 1,
    MINT = 2,
    SALE = 3,
}

export default class MegaWalletEventEntity {
    nftId: string;
    denomId: string;
    tokenId: string;
    fromAddress: string;
    toAddress: string;
    timestamp: number;
    eventType: MegaWalletEventType;
    transferPriceInUsd: number;
    transferPriceInBtc: BigNumber;
    transferPriceInAcudos: BigNumber;

    constructor() {
        this.denomId = '';
        this.tokenId = '';
        this.fromAddress = '';
        this.toAddress = '';
        this.timestamp = NOT_EXISTS_INT
        this.eventType = MegaWalletEventType.MINT;
        this.transferPriceInUsd = NOT_EXISTS_INT;
        this.transferPriceInBtc = new BigNumber(NOT_EXISTS_INT);
        this.transferPriceInAcudos = new BigNumber(NOT_EXISTS_INT);
    }

    static fromNftEventEntity(nftEventEntity: NftEventEntity, collectionEntity: COllectionEntity): MegaWalletEventEntity {

    }

    static toJson(entity: MegaWalletEventEntity): any {
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
