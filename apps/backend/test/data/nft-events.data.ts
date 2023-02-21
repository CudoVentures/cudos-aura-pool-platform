import BigNumber from 'bignumber.js';
import ChainMarketplaceCollectionEntity from '../../src/collection/entities/chain-marketplace-collection.entity';
import NftMarketplaceTradeHistoryEntity from '../../src/graphql/entities/nft-marketplace-trade-history.entity';
import NftModuleNftTransferEntity from '../../src/graphql/entities/nft-module-nft-transfer-history';
import { getZeroDatePlusDaysTimestamp } from '../../src/statistics/utils/test.utils';
import { collectionEntities } from './collections.data';
import nftTestEntitities from './nft.data';

const chainMarketplaceNftTradeEventEntities = [];
const chainNftTransferHistoryEntities = [];

nftTestEntitities.forEach((nftEntity) => {
    if (nftEntity.tokenId === '') {
        return;
    }

    const collectionEntity = collectionEntities.find((entity) => entity.id === nftEntity.collectionId);

    for (let i = 1; i <= parseInt(nftEntity.collectionId); i++) {
        chainMarketplaceNftTradeEventEntities.push({
            buyer: 'testbuyer',
            btcPrice: new BigNumber(i / 10000),
            denomId: collectionEntity.denomId,
            acudosPrice: new BigNumber(i),
            seller: '0x0',
            timestamp: getZeroDatePlusDaysTimestamp(i - 1),
            tokenId: nftEntity.tokenId,
            usdPrice: i,
            transactionHash: 'someminttxhash',
        });
        chainMarketplaceNftTradeEventEntities.push({
            buyer: 'testowner',
            btcPrice: new BigNumber(i / 10000),
            denomId: collectionEntity.denomId,
            acudosPrice: new BigNumber(i),
            seller: 'testbuyer',
            timestamp: getZeroDatePlusDaysTimestamp(i),
            tokenId: nftEntity.tokenId,
            usdPrice: i,
            transactionHash: 'someresaletxhash',
        });

        chainNftTransferHistoryEntities.push({
            tokenId: nftEntity.tokenId,
            denomId: collectionEntity.denomId,
            newOwner: 'testowner',
            oldOwner: 'testbuyer',
            timestamp: getZeroDatePlusDaysTimestamp(i - 1),
            transactionHash: 'somehash',
        })

        // add some fore today as well
        chainMarketplaceNftTradeEventEntities.push({
            buyer: 'testbuyer',
            btcPrice: new BigNumber(i / 10000),
            denomId: collectionEntity.denomId,
            acudosPrice: new BigNumber(i),
            seller: '0x0',
            timestamp: Date.now() - 4000,
            tokenId: nftEntity.tokenId,
            usdPrice: i,
            transactionHash: 'sometxhash',
        });
        chainMarketplaceNftTradeEventEntities.push({
            buyer: 'testowner',
            btcPrice: new BigNumber(i / 10000),
            denomId: collectionEntity.denomId,
            acudosPrice: new BigNumber(i),
            seller: 'testbuyer',
            timestamp: Date.now() - 3600,
            tokenId: nftEntity.tokenId,
            usdPrice: i,
            transactionHash: 'sometxhash',
        });

        chainNftTransferHistoryEntities.push({
            tokenId: nftEntity.tokenId,
            denomId: collectionEntity.denomId,
            newOwner: 'testowner',
            oldOwner: 'testbuyer',
            timestamp: Date.now() - 4000,
            transactionHash: 'somehash',
        })
    }
});

export function getGraphQlMarketplaceNftEvents(): NftMarketplaceTradeHistoryEntity[] {
    return chainMarketplaceNftTradeEventEntities.map((json, index) => {
        const entity = new NftMarketplaceTradeHistoryEntity();

        entity.buyer = json.buyer;
        entity.btcPrice = json.btcPrice;
        entity.tokenId = json.tokenId;
        entity.denomId = json.denomId;
        entity.acudosPrice = json.acudosPrice;
        entity.seller = json.seller;
        entity.timestamp = json.timestamp;
        entity.usdPrice = json.usdPrice;
        entity.transactionHash = json.transactionHash;

        return entity;
    });
}

export function getGraphQlNftNftEvents(): NftModuleNftTransferEntity[] {
    return chainNftTransferHistoryEntities.map((json) => {
        const entity = new NftModuleNftTransferEntity();

        entity.denomId = json.denomId;
        entity.newOwner = json.newOwner;
        entity.oldOwner = json.oldOgetGraphQlNftNftEventswner;
        entity.timestamp = json.timestamp;
        entity.tokenId = json.tokenId;
        entity.transactionHash = json.transactionHash;

        return entity;
    })
}
