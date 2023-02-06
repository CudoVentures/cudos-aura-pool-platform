import { NftStatus } from '../../nft/nft.types';
import { NftRepo } from '../../nft/repos/nft.repo';
import { NftOwnersPayoutHistoryRepo } from '../repos/nft-owners-payout-history.repo';
import { NftPayoutHistoryRepo } from '../repos/nft-payout-history.repo';
import { v4 as uuidv4 } from 'uuid';
import { CollectionRepo } from '../../collection/repos/collection.repo';
import { Royalty } from 'cudosjs/build/stargate/modules/marketplace/proto-types/royalty';
import ChainMarketplaceCollectionEntity from '../../collection/entities/chain-marketplace-collection.entity';
import NftMarketplaceTradeHistoryEntity from '../../graphql/entities/nft-marketplace-trade-history.entity';
import BigNumber from 'bignumber.js';
import NftModuleNftTransferEntity from '../../graphql/entities/nft-module-nft-transfer-history';
import { collectionEntities } from '../../../test/data/collections.data';
import { CollectionEntity } from '../../collection/entities/collection.entity';
import { FarmStatus } from '../../farm/farm.types';
import { MiningFarmRepo } from '../../farm/repos/mining-farm.repo';
import MiningFarmEntity from '../../farm/entities/mining-farm.entity';
import { AddressesPayoutHistoryRepo } from '../repos/addresses-payout-history.repo';

export const miningFarmTestEntities = [MiningFarmEntity.fromJson({
    id: '1',
    accountId: '1',
    name: 'testFarmName',
    legalName: 'testFarmNameLtd',
    primaryAccountOwnerName: 'Test Testov',
    primaryAccountOwnerEmail: 'test@test.com',
    description: 'string',
    manufacturerIds: ['1'],
    minerIds: ['1'],
    energySourceIds: ['1'],
    hashPowerInTh: 123123,
    machinesLocation: 'test location',
    profileImgUrl: 'some test url',
    coverImgUrl: 'some test url',
    farmPhotoUrls: ['some test url'],
    status: FarmStatus.APPROVED,
    maintenanceFeeInBtc: '1',
    cudosMintNftRoyaltiesPercent: 10,
    cudosResaleNftRoyaltiesPercent: 2,
    resaleFarmRoyaltiesCudosAddress: 'testCudosAddress',
    rewardsFromPoolBtcAddress: 'leftoversTestAddress',
    leftoverRewardsBtcAddress: 'testpayout',
    maintenanceFeePayoutBtcAddress: 'maintenanceTestAddress',
}),
MiningFarmEntity.fromJson({
    id: '2',
    accountId: '1',
    name: 'testFarmName',
    legalName: 'testFarmNameLtd',
    primaryAccountOwnerName: 'Test Testov',
    primaryAccountOwnerEmail: 'test@test.com',
    description: 'string',
    manufacturerIds: ['1'],
    minerIds: ['1'],
    energySourceIds: ['1'],
    hashPowerInTh: 123123,
    machinesLocation: 'test location',
    profileImgUrl: 'some test url',
    coverImgUrl: 'some test url',
    farmPhotoUrls: ['some test url'],
    status: FarmStatus.APPROVED,
    maintenanceFeeInBtc: '1',
    cudosMintNftRoyaltiesPercent: 10,
    cudosResaleNftRoyaltiesPercent: 2,
    resaleFarmRoyaltiesCudosAddress: 'testCudosAddress',
    rewardsFromPoolBtcAddress: 'leftoversTestAddress',
    leftoverRewardsBtcAddress: 'testpayout',
    maintenanceFeePayoutBtcAddress: 'maintenanceTestAddress',
}),
];

export const nftTestEntitities = [];
const nftPayoutHistoryEntities = [];
const nftOwnersPayoutHistoryEntities = [];
const addressesPayoutHistoryEntities = [];

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

    // used for custom test collection and nfts////////////////////////////////////////////////////////////
    chainMarketplaceTradeHistoryEntities.push({
        buyer: 'testbuyer',
        btcPrice: new BigNumber(i / 10000),
        denomId: 'string',
        acudosPrice: new BigNumber(i),
        seller: '0x0',
        timestamp: getZeroDatePlusDaysTimestamp(i - 1),
        tokenId: `1${i}`,
        usdPrice: i,
        transactionHash: 'sometxhash',
    });
    chainMarketplaceTradeHistoryEntities.push({
        buyer: 'testowner',
        btcPrice: new BigNumber(i / 10000),
        denomId: 'string',
        acudosPrice: new BigNumber(i),
        seller: 'testbuyer',
        timestamp: getZeroDatePlusDaysTimestamp(i),
        tokenId: `1${i}`,
        usdPrice: i,
        transactionHash: 'sometxhash',
    });

    chainNftTransferHistoryEntities.push({
        tokenId: `1${i}`,
        denomId: 'string',
        newOwner: 'testowner',
        oldOwner: 'testbuyer',
        timestamp: getZeroDatePlusDaysTimestamp(i - 1),
        transactionHash: 'somehash',
    })
    /// ////////////////////////////////////////////////////////
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

for (let i = 1; i <= 5; i++) {

    const uuid = uuidv4();

    nftTestEntitities.push({
        id: uuid,
        name: `nft${i}`,
        uri: 'someuri',
        data: 'somestring',
        hashingPower: i,
        price: `${i}00`,
        priceInEth: '100',
        expirationDate: new Date(2024, 10, 9),
        status: NftStatus.MINTED,
        tokenId: `${i}`,
        collectionId: i,
        creatorId: i,
        deletedAt: null,
        currentOwner: 'testowner',
        marketplaceNftId: `${i}`,
        createdAt: new Date(getZeroDatePlusDaysTimestamp(i - 1)),
        updatedAt: new Date(getZeroDatePlusDaysTimestamp(i - 1)),
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

    addressesPayoutHistoryEntities.push({
        id: i,
        address: 'testpayout',
        amount_btc: i,
        tx_hash: 'txHash',
        farm_id: 1,
        createdAt: new Date(getZeroDatePlusDaysTimestamp(i - 1)),
        updatedAt: new Date(getZeroDatePlusDaysTimestamp(i - 1)),
        payout_time: getZeroDatePlusDaysTimestamp(i - 1) / 1000,
        threshold_reached: true,
    })
}

export async function fillStatisticsTestData() {
    try {
        await MiningFarmRepo.bulkCreate(miningFarmTestEntities.map((entity) => MiningFarmEntity.toRepo(entity).toJSON()))
        await CollectionRepo.bulkCreate(collectionEntities.map((entity) => CollectionEntity.toRepo(entity).toJSON()));
        await NftRepo.bulkCreate(nftTestEntitities);
        await NftPayoutHistoryRepo.bulkCreate(nftPayoutHistoryEntities);
        await NftOwnersPayoutHistoryRepo.bulkCreate(nftOwnersPayoutHistoryEntities);
        await AddressesPayoutHistoryRepo.bulkCreate(addressesPayoutHistoryEntities);
    } catch (e) {
        console.log(e);
    }
}

export async function emptyStatisticsTestData() {
    await MiningFarmRepo.truncate({ cascade: true });
    await CollectionRepo.truncate({ cascade: true });
    await NftRepo.truncate({ cascade: true });
    await NftPayoutHistoryRepo.truncate({ cascade: true });
    await NftOwnersPayoutHistoryRepo.truncate({ cascade: true });
    await AddressesPayoutHistoryRepo.truncate({ cascade: true });
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
    return chainMarketplaceTradeHistoryEntities.map((json, index) => {
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
        entity.oldOwner = json.oldOwner;
        entity.timestamp = json.timestamp;
        entity.tokenId = json.tokenId;
        entity.transactionHash = json.transactionHash;

        return entity;
    });
}
