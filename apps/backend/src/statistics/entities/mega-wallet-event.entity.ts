import BigNumber from 'bignumber.js';
import { ChainMarketplaceCollectionDto } from '../../collection/dto/chain-marketplace-collection.dto';
import { CollectionEntity } from '../../collection/entities/collection.entity';
import { NOT_EXISTS_INT } from '../../common/utils';
import MiningFarmEntity from '../../farm/entities/mining-farm.entity';
import NftEventEntity from './nft-event.entity';

export enum MegaWalletEventType {
    FEE = 1,
}

export default class MegaWalletEventEntity {
    nftId: string;
    fromAddress: string;
    timestamp: number;
    eventType: MegaWalletEventType;
    transferPriceInUsd: number;
    transferPriceInAcudos: BigNumber;

    constructor() {
        this.fromAddress = '';
        this.timestamp = NOT_EXISTS_INT
        this.eventType = MegaWalletEventType.FEE;
        this.transferPriceInUsd = NOT_EXISTS_INT;
        this.transferPriceInAcudos = new BigNumber(NOT_EXISTS_INT);
    }

    static fromNftEventEntity(nftEventEntity: NftEventEntity, marketplaceCollectionEntity: ChainMarketplaceCollectionDto, farmEntity: MiningFarmEntity): MegaWalletEventEntity {
        const megaWalletEventEntity = new MegaWalletEventEntity();

        megaWalletEventEntity.nftId = nftEventEntity.nftId ?? megaWalletEventEntity.nftId;
        megaWalletEventEntity.timestamp = nftEventEntity.timestamp ?? megaWalletEventEntity.timestamp;

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
            'transferPriceInAcudos': entity.transferPriceInAcudos.toString(),
        }
    }
}
