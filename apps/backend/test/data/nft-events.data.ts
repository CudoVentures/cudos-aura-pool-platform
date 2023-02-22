import BigNumber from 'bignumber.js';
import NftMarketplaceTradeHistoryEntity from '../../src/graphql/entities/nft-marketplace-trade-history.entity';
import NftModuleNftTransferEntity from '../../src/graphql/entities/nft-module-nft-transfer-history';
import { getZeroDatePlusDaysTimestamp } from '../../src/statistics/utils/test.utils';
import { collectionEntities } from './collections.data';
import nftTestEntitities from './nft.data';

const chainMarketplaceNftTradeEventEntities = [];
const chainNftTransferHistoryEntities = [];

// TODO: the cycle is not necessary here, should be reworked
// for each nftEntity add  collectionId * (4 marketplace events + 2 nft module events)

// nft module events - one is the zero date plus days equal to collectionId - 1, the other is Date.now() so to be fitlered byt timestamp from zero date
// nft module events - transfer events
// nft module events - old owner = testbuyer, new owner = testowner

// marketplace module events - 2 are zero date plus days equal to collectionId - 1, the others are Date.now() so to be fitlered byt timestamp from zero date
// marketplace module events - 1 mint event and one buy event
// marketplace module events - mint event seller is the zero address, the buyer = "testbuyer"
// marketplace module events - btcPrice is i / 10000 (so for collectionId 1 there are two nft mint events with btcPrice 0.0001 and 2 sell events with the same price)
// marketplace module events - acudosPrice is i
// marketplace module events - usdPrice is i

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
            timestamp: getZeroDatePlusDaysTimestamp(i - 1),
            transactionHash: 'somehash',
        })

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
