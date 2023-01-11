import BigNumber from 'bignumber.js';
import ChainMarketplaceCollectionEntity from '../../src/collection/entities/chain-marketplace-collection.entity';
import NftMarketplaceTradeHistoryEntity from '../../src/graphql/entities/nft-marketplace-trade-history.entity';
import { getZeroDatePlusDaysTimestamp } from '../../src/statistics/utils/test.utils';
import { collectionEntities } from './collections.data';
import nftTestEntitities from './nft.data';

const chainMarketplaceCollectionEntities = [];
const chainNftTransferHistoryEntities = [];

nftTestEntitities.forEach((nftEntity) => {
    const collectionEntity = collectionEntities.find((entity) => entity.id === nftEntity.collectionId);

    for (let i = 1; i <= parseInt(nftEntity.collectionId); i++) {
        chainMarketplaceCollectionEntities.push({
            buyer: 'testbuyer',
            btcPrice: new BigNumber(i / 10000),
            denomId: collectionEntity.denomId,
            acudosPrice: new BigNumber(i),
            seller: '0x0',
            timestamp: getZeroDatePlusDaysTimestamp(i - 1),
            tokenId: nftEntity.tokenId,
            usdPrice: i,
            transactionHash: 'sometxhash',
        });
        chainMarketplaceCollectionEntities.push({
            buyer: 'testowner',
            btcPrice: new BigNumber(i / 10000),
            denomId: collectionEntity.denomId,
            acudosPrice: new BigNumber(i),
            seller: 'testbuyer',
            timestamp: getZeroDatePlusDaysTimestamp(i),
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
    }
});

export function getGraphQlmarketplaceCollections(): ChainMarketplaceCollectionEntity[] {
    return chainMarketplaceCollectionEntities.map((json) => {
        const entity = new ChainMarketplaceCollectionEntity();

        entity.creator = json.creator;
        entity.denomId = json.denomId;
        entity.farmId = json.farmId;
        entity.farmMintRoyaltiesAddress = json.farmId;
        entity.farmMintRoyaltiesAddress = json.farmMintRoyaltiesAddress;
        entity.farmResaleRoyaltiesAddress = json.farmResaleRoyaltiesAddress;
        entity.platformRoyaltiesAddress = json.platformRoyaltiesAddress;
        entity.mintRoyalties = json.mintRoyalties;
        entity.resaleRoyalties = json.resaleRoyalties;
        entity.verified = json.verified;

        return entity;
    });
}

export function getGraphQlMarketplaceNftEvents(): NftMarketplaceTradeHistoryEntity[] {
    return chainNftTransferHistoryEntities.map((json, index) => {
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
