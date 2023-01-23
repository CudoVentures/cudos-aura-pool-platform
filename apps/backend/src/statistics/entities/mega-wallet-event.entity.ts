import BigNumber from 'bignumber.js';
import ChainMarketplaceCollectionEntity from '../../collection/entities/chain-marketplace-collection.entity';
import { NOT_EXISTS_INT } from '../../common/utils';
import MiningFarmEntity from '../../farm/entities/mining-farm.entity';
import NftEventEntity, { NftTransferHistoryEventType } from './nft-event.entity';

export default class MegaWalletEventEntity {
    nftId: string;
    fromAddress: string;
    timestamp: number;
    eventType: NftTransferHistoryEventType;
    transferPriceInUsd: number;
    transferPriceInAcudos: BigNumber;

    constructor() {
        this.fromAddress = '';
        this.timestamp = NOT_EXISTS_INT
        this.eventType = NftTransferHistoryEventType.MINT;
        this.transferPriceInUsd = NOT_EXISTS_INT;
        this.transferPriceInAcudos = new BigNumber(NOT_EXISTS_INT);
    }

    static fromNftEventEntity(nftEventEntity: NftEventEntity, marketplaceCollectionEntity: ChainMarketplaceCollectionEntity, farmEntity: MiningFarmEntity): MegaWalletEventEntity {
        const megaWalletEventEntity = new MegaWalletEventEntity();

        megaWalletEventEntity.nftId = nftEventEntity.nftId ?? megaWalletEventEntity.nftId;
        megaWalletEventEntity.timestamp = nftEventEntity.timestamp ?? megaWalletEventEntity.timestamp;
        megaWalletEventEntity.eventType = nftEventEntity.eventType
        // mega walelt receives the fee from the nft buyer, which is "toAddress" in the nft event entity
        megaWalletEventEntity.fromAddress = nftEventEntity.toAddress ?? megaWalletEventEntity.fromAddress;

        // for mint use the mint cudos royalties, else use resale royalties
        const ownerAddress = farmEntity.resaleFarmRoyaltiesCudosAddress;
        const cudosRoyaltiespercent = nftEventEntity.isMintEvent() === true
            ? marketplaceCollectionEntity.mintRoyalties.find((royalty) => royalty.address !== ownerAddress)
            : marketplaceCollectionEntity.resaleRoyalties.find((royalty) => royalty.address !== ownerAddress)

        // make as float
        const cudosRoyaltiespercentAsFloat = parseFloat(cudosRoyaltiespercent.percent) / 100;

        megaWalletEventEntity.transferPriceInAcudos = nftEventEntity.transferPriceInAcudos.multipliedBy(cudosRoyaltiespercentAsFloat);
        megaWalletEventEntity.transferPriceInUsd = nftEventEntity.transferPriceInUsd * cudosRoyaltiespercentAsFloat;

        return megaWalletEventEntity;
    }

    static toJson(entity: MegaWalletEventEntity): any {
        return {
            'nftId': entity.nftId,
            'fromAddress': entity.fromAddress,
            'timestamp': entity.timestamp,
            'eventType': entity.eventType,
            'transferPriceInUsd': entity.transferPriceInUsd,
            'transferPriceInAcudos': entity.transferPriceInAcudos.toString(10),
        }
    }
}
