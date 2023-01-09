import { NftStatus } from '../../nft/nft.types';
import { NftRepo } from '../../nft/repos/nft.repo';
import { NftOwnersPayoutHistoryRepo } from '../repos/nft-owners-payout-history.repo';
import { NftPayoutHistoryRepo } from '../repos/nft-payout-history.repo';
import { v4 as uuidv4 } from 'uuid';
import { CollectionStatus } from '../../collection/utils';
import { CollectionRepo } from '../../collection/repos/collection.repo';
import { Royalty } from 'cudosjs/build/stargate/modules/marketplace/proto-types/royalty';
import ChainMarketplaceCollectionEntity from '../../collection/entities/chain-marketplace-collection.entity';
import NftMarketplaceTradeHistoryEntity from '../../graphql/entities/nft-marketplace-trade-history.entity';
import BigNumber from 'bignumber.js';
import NftModuleNftTransferEntity from '../../graphql/entities/nft-module-nft-transfer-history';

export const nftTestEntitities = [];
const nftPayoutHistoryEntities = [];
const nftOwnersPayoutHistoryEntities = [];

export const chainMarketplaceTradeHistoryEntities = []
export const chainNftTransferHistoryEntities = []

for (let i = 1; i <= 5; i++) {
    chainMarketplaceTradeHistoryEntities.push({
        buyer: 'testbuyer',
        btcPrice: new BigNumber(i / 10000),
        denomId: `testdenomid${i}`,
        acudosPrice: new BigNumber(i),
        seller: '0x0',
        timestamp: getZeroDatePlusDaysTimestamp(i - 1),
        tokenId: `${i}`,
        usdPrice: i,
        transactionHash: 'sometxhash',
    });
    chainMarketplaceTradeHistoryEntities.push({
        buyer: 'testowner',
        btcPrice: new BigNumber(i / 10000),
        denomId: `testdenomid${i}`,
        acudosPrice: new BigNumber(i),
        seller: 'testbuyer',
        timestamp: getZeroDatePlusDaysTimestamp(i),
        tokenId: `${i}`,
        usdPrice: i,
        transactionHash: 'sometxhash',
    });

    chainNftTransferHistoryEntities.push({
        tokenId: `${i}`,
        denomId: `testdenomid${i}`,
        newOwner: 'testowner',
        oldOwner: 'testbuyer',
        timestamp: getZeroDatePlusDaysTimestamp(i - 1),
        transactionHash: 'somehash',
    })
}

const chainMarketplaceCollectionEntities = [
    {
        mintRoyalties: [
            Royalty.fromJSON({ address: 'cudostestfarmaddress', percent: 90 }),
            Royalty.fromJSON({ address: 'cudostestplatformaddress', percent: 10 }),
        ],
        resaleRoyalties: [
            Royalty.fromJSON({ address: 'cudostestfarmaddress', percent: 10 }),
            Royalty.fromJSON({ address: 'cudostestplatformaddress', percent: 10 }),
        ],
        verified: true,
        creator: 'cudostestfarmaddress',
        denomId: 'testdenomid1',
        farmId: '1',
        platformRoyaltiesAddress: 'cudostestplatformaddress',
        farmMintRoyaltiesAddress: 'cudostestfarmaddress',
        farmResaleRoyaltiesAddress: 'cudostestfarmaddress',
    }, {
        mintRoyalties: [
            Royalty.fromJSON({ address: 'cudostestfarmaddress', percent: 90 }),
            Royalty.fromJSON({ address: 'cudostestplatformaddress', percent: 10 }),
        ],
        resaleRoyalties: [
            Royalty.fromJSON({ address: 'cudostestfarmaddress', percent: 10 }),
            Royalty.fromJSON({ address: 'cudostestplatformaddress', percent: 10 }),
        ],
        verified: true,
        creator: 'cudostestfarmaddress',
        denomId: 'testdenomid2',
        farmId: '1',
        platformRoyaltiesAddress: 'cudostestplatformaddress',
        farmMintRoyaltiesAddress: 'cudostestfarmaddress',
        farmResaleRoyaltiesAddress: 'cudostestfarmaddress',
    }, {
        mintRoyalties: [
            Royalty.fromJSON({ address: 'cudostestfarmaddress', percent: 90 }),
            Royalty.fromJSON({ address: 'cudostestplatformaddress', percent: 10 }),
        ],
        resaleRoyalties: [
            Royalty.fromJSON({ address: 'cudostestfarmaddress', percent: 10 }),
            Royalty.fromJSON({ address: 'cudostestplatformaddress', percent: 10 }),
        ],
        verified: true,
        creator: 'cudostestfarmaddress',
        denomId: 'testdenomid3',
        farmId: '1',
        platformRoyaltiesAddress: 'cudostestplatformaddress',
        farmMintRoyaltiesAddress: 'cudostestfarmaddress',
        farmResaleRoyaltiesAddress: 'cudostestfarmaddress',
    }, {
        mintRoyalties: [
            Royalty.fromJSON({ address: 'cudostestfarmaddress2', percent: 90 }),
            Royalty.fromJSON({ address: 'cudostestplatformaddress', percent: 10 }),
        ],
        resaleRoyalties: [
            Royalty.fromJSON({ address: 'cudostestfarmaddress2', percent: 10 }),
            Royalty.fromJSON({ address: 'cudostestplatformaddress', percent: 10 }),
        ],
        verified: true,
        creator: 'cudostestfarmaddress',
        denomId: 'testdenomid4',
        farmId: '2',
        platformRoyaltiesAddress: 'cudostestplatformaddress',
        farmMintRoyaltiesAddress: 'cudostestfarmaddress2',
        farmResaleRoyaltiesAddress: 'cudostestfarmaddress2',
    }, {
        mintRoyalties: [
            Royalty.fromJSON({ address: 'cudostestfarmaddress2', percent: 90 }),
            Royalty.fromJSON({ address: 'cudostestplatformaddress', percent: 10 }),
        ],
        resaleRoyalties: [
            Royalty.fromJSON({ address: 'cudostestfarmaddress2', percent: 10 }),
            Royalty.fromJSON({ address: 'cudostestplatformaddress', percent: 10 }),
        ],
        verified: true,
        creator: 'cudostestfarmaddress',
        denomId: 'testdenomid5',
        farmId: '2',
        platformRoyaltiesAddress: 'cudostestplatformaddress',
        farmMintRoyaltiesAddress: 'cudostestfarmaddress2',
        farmResaleRoyaltiesAddress: 'cudostestfarmaddress2',
    },
];

const collectionEntities = [{
    id: 1,
    name: 'testcollection',
    description: 'testcollectiondescription',
    denomId: 'testdenomid1',
    hashingPower: '15',
    royalties: '10',
    mainImage: 'testuri',
    bannerImage: 'testuri',
    status: CollectionStatus.APPROVED,
    farmId: 1,
    creatorId: 1,
    timestampDeletedAt: -1,
}, {
    id: 2,
    name: 'testcollection2',
    description: 'testcollectiondescription',
    denomId: 'testdenomid2',
    hashingPower: '15',
    royalties: '10',
    mainImage: 'testuri',
    bannerImage: 'testuri',
    status: CollectionStatus.APPROVED,
    farmId: 1,
    creatorId: 1,
    timestampDeletedAt: -1,
}, {
    id: 3,
    name: 'testcollection3',
    description: 'testcollectiondescription',
    denomId: 'testdenomid3',
    hashingPower: '15',
    royalties: '10',
    mainImage: 'testuri',
    bannerImage: 'testuri',
    status: CollectionStatus.APPROVED,
    farmId: 1,
    creatorId: 1,
    timestampDeletedAt: -1,
}, {
    id: 4,
    name: 'testcollection4',
    description: 'testcollectiondescription',
    denomId: 'testdenomid4',
    hashingPower: '15',
    royalties: '10',
    mainImage: 'testuri',
    bannerImage: 'testuri',
    status: CollectionStatus.APPROVED,
    farmId: 2,
    creatorId: 2,
    timestampDeletedAt: -1,
}, {
    id: 5,
    name: 'testcollection5',
    description: 'testcollectiondescription',
    denomId: 'testdenomid5',
    hashingPower: '15',
    royalties: '10',
    mainImage: 'testuri',
    bannerImage: 'testuri',
    status: CollectionStatus.APPROVED,
    farmId: 2,
    creatorId: 2,
    timestampDeletedAt: -1,
}];

for (let i = 1; i <= 5; i++) {
    nftTestEntitities.push({
        id: uuidv4(),
        name: `nft${i}`,
        uri: 'someuri',
        data: 'somestring',
        hashingPower: i,
        price: `${i}00`,
        expirationDate: new Date(2024, 10, 9),
        status: NftStatus.MINTED,
        tokenId: `${i}`,
        collectionId: i,
        creatorId: i,
        deletedAt: null,
        currentOwner: 'testowner',
        marketplaceNftId: i,
    });

    nftPayoutHistoryEntities.push({
        id: i,
        token_id: i,
        denom_id: `testdenomid${i}`,
        payout_period_start: getZeroDatePlusDaysTimestamp(0),
        payout_period_end: getZeroDatePlusDaysTimestamp(5),
        reward: `${i}`,
        tx_hash: `txhash${i}`,
        maintenance_fee: i,
        cudo_part_of_maintenance_fee: i,
        createdAt: new Date(getZeroDatePlusDaysTimestamp(i - 1)),
        updatedAt: new Date(getZeroDatePlusDaysTimestamp(i - 1)),
    });

    nftOwnersPayoutHistoryEntities.push({
        id: i,
        time_owned_from: i,
        time_owned_to: i,
        total_time_owned: i,
        percent_of_time_owned: i,
        owner: 'testowner',
        payout_address: 'testpayout',
        reward: `${i}`,
        nft_payout_history_id: i,
        createdAt: new Date(getZeroDatePlusDaysTimestamp(i - 1)),
        updatedAt: new Date(getZeroDatePlusDaysTimestamp(i - 1)),
        sent: true,
    })
}

export async function fillStatisticsTestData() {
    try {
        await CollectionRepo.bulkCreate(collectionEntities);
        await NftRepo.bulkCreate(nftTestEntitities);
        await NftPayoutHistoryRepo.bulkCreate(nftPayoutHistoryEntities);
        await NftOwnersPayoutHistoryRepo.bulkCreate(nftOwnersPayoutHistoryEntities);
    } catch (e) {
        console.log(e);
    }
}

export async function emptyStatisticsTestData() {
    await CollectionRepo.truncate({ cascade: true });
    await NftRepo.truncate({ cascade: true });
    await NftPayoutHistoryRepo.truncate({ cascade: true });
    await NftOwnersPayoutHistoryRepo.truncate({ cascade: true });
}

export function getZeroDatePlusDaysTimestamp(numberOfDaysToAdd: number): number {
    const zeroDate = new Date(0);
    const result = zeroDate.setDate(zeroDate.getDate() + numberOfDaysToAdd);

    return result;
}

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
    return chainMarketplaceTradeHistoryEntities.map((json) => {
        const entity = new NftMarketplaceTradeHistoryEntity();

        entity.buyer = json.buyer;
        entity.btcPrice = json.btcPrice;
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
    return chainMarketplaceTradeHistoryEntities.map((json) => {
        const entity = new NftModuleNftTransferEntity();

        entity.denomId = json.denomId;
        entity.newOwner = json.newOwner;
        entity.oldOwner = json.oldOwner;
        entity.timestamp = json.timestamp;
        entity.tokenId = json.tokenId;
        entity.transactionHash = json.transactionHash;

        return entity;
    });
}
