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
import NftEntity from '../../nft/entities/nft.entity';
import UserEntity from '../../account/entities/user.entity';
import NftEventEntity, { NftTransferHistoryEventType } from '../entities/nft-event.entity';
import NftEventFilterEntity from '../entities/nft-event-filter.entity';
import { IntBoolValue, NOT_EXISTS_STRING } from '../../common/utils';
import { NftEventType } from '../../../../frontend/src/analytics/entities/NftEventEntity';
import MegaWalletEventFilterEntity from '../entities/mega-wallet-event-filter.entity';

export function createBasicQueuedNft(id: string, name: string, hashingPower: number, acudosPrice: string, tokenId: string, collectionId: number, creatorId: number, currentOwner: string, marketplaceNftId: string): NftEntity {
    return createBasicNft(id, name, hashingPower, acudosPrice, NftStatus.QUEUED, tokenId, collectionId, creatorId, currentOwner, marketplaceNftId);
}

export function createBasicMintedNft(id: string, name: string, hashingPower: number, acudosPrice: string, tokenId: string, collectionId: number, creatorId: number, currentOwner: string, marketplaceNftId: string): NftEntity {
    return createBasicNft(id, name, hashingPower, acudosPrice, NftStatus.MINTED, tokenId, collectionId, creatorId, currentOwner, marketplaceNftId);
}

export function createBasicRemovedNft(id: string, name: string, hashingPower: number, acudosPrice: string, tokenId: string, collectionId: number, creatorId: number, currentOwner: string, marketplaceNftId: string): NftEntity {
    return createBasicNft(id, name, hashingPower, acudosPrice, NftStatus.REMOVED, tokenId, collectionId, creatorId, currentOwner, marketplaceNftId);
}

export function createBasicNft(id: string, name: string, hashingPower: number, acudosPrice: string, status: NftStatus, tokenId: string, collectionId: number, creatorId: number, currentOwner: string, marketplaceNftId: string): NftEntity {
    const nftEntity = new NftEntity();

    nftEntity.id = id;
    nftEntity.name = name;
    nftEntity.hashingPower = hashingPower;
    nftEntity.acudosPrice = new BigNumber(acudosPrice);
    nftEntity.expirationDateTimestamp = (new Date(2124, 1, 1)).getDate();
    nftEntity.status = status;
    nftEntity.tokenId = tokenId;
    nftEntity.collectionId = collectionId;
    nftEntity.creatorId = creatorId;
    nftEntity.deletedAt = null;
    nftEntity.currentOwner = currentOwner;
    nftEntity.marketplaceNftId = marketplaceNftId;

    return nftEntity;
}

export function createBasicUser(userId: number, accountId: number, cudosTestWallet: string): UserEntity {
    const userEntity = new UserEntity();

    userEntity.userId = userId;
    userEntity.accountId = accountId;
    userEntity.cudosWalletAddress = cudosTestWallet;

    return userEntity;
}

export function createBasicNftMintEvent(nftId: string, denomId: string, tokenId: string, fromAddress: string, toAddress: string, timestamp: number, transferPriceInUsd: number, transferPriceInBtc: string, transferPriceInAcudos: string): NftEventEntity {
    return createBasicNftEvent(nftId, denomId, tokenId, fromAddress, toAddress, timestamp, NftTransferHistoryEventType.MINT, transferPriceInUsd, transferPriceInBtc, transferPriceInAcudos);
}

export function createBasicNftSaleEvent(nftId: string, denomId: string, tokenId: string, fromAddress: string, toAddress: string, timestamp: number, transferPriceInUsd: number, transferPriceInBtc: string, transferPriceInAcudos: string): NftEventEntity {
    return createBasicNftEvent(nftId, denomId, tokenId, fromAddress, toAddress, timestamp, NftTransferHistoryEventType.SALE, transferPriceInUsd, transferPriceInBtc, transferPriceInAcudos);
}

export function createBasicNftTransferEvent(nftId: string, denomId: string, tokenId: string, fromAddress: string, toAddress: string, timestamp: number, transferPriceInUsd: number, transferPriceInBtc: string, transferPriceInAcudos: string): NftEventEntity {
    return createBasicNftEvent(nftId, denomId, tokenId, fromAddress, toAddress, timestamp, NftTransferHistoryEventType.TRANSFER, transferPriceInUsd, transferPriceInBtc, transferPriceInAcudos);
}

export function createBasicNftEvent(nftId: string, denomId: string, tokenId: string, fromAddress: string, toAddress: string, timestamp: number, eventType: NftTransferHistoryEventType, transferPriceInUsd: number, transferPriceInBtc: string, transferPriceInAcudos: string): NftEventEntity {
    const nftEventEntity = new NftEventEntity();

    nftEventEntity.nftId = nftId;
    nftEventEntity.denomId = denomId;
    nftEventEntity.tokenId = tokenId;
    nftEventEntity.fromAddress = fromAddress;
    nftEventEntity.toAddress = toAddress;
    nftEventEntity.timestamp = timestamp
    nftEventEntity.eventType = eventType;
    nftEventEntity.transferPriceInUsd = transferPriceInUsd;
    nftEventEntity.transferPriceInBtc = new BigNumber(transferPriceInBtc);
    nftEventEntity.transferPriceInAcudos = new BigNumber(transferPriceInAcudos);

    return nftEventEntity;
}

export function createNftEventPlatformFilterEntity(eventTypes: NftTransferHistoryEventType[], timestampFrom: number, timestampTo: number, from: number, count: number): NftEventFilterEntity {
    return createNftEventFilterEntity(IntBoolValue.FALSE, NOT_EXISTS_STRING, NOT_EXISTS_STRING, eventTypes, timestampFrom, timestampTo, from, count);
}

export function createNftEventSessionAccountFilterEntity(sessionAccount: IntBoolValue, eventTypes: NftTransferHistoryEventType[], timestampFrom: number, timestampTo: number, from: number, count: number): NftEventFilterEntity {
    return createNftEventFilterEntity(sessionAccount, NOT_EXISTS_STRING, NOT_EXISTS_STRING, eventTypes, timestampFrom, timestampTo, from, count);
}

export function createNftEventFilterEntity(sessionAccount: IntBoolValue, nftId: string, miningFarmId: string, eventTypes: NftTransferHistoryEventType[], timestampFrom: number, timestampTo: number, from: number, count: number): NftEventFilterEntity {
    const nftEventFilterEntity = new NftEventFilterEntity();

    nftEventFilterEntity.sessionAccount = sessionAccount;
    nftEventFilterEntity.nftId = nftId;
    nftEventFilterEntity.miningFarmId = miningFarmId;
    nftEventFilterEntity.eventTypes = eventTypes;
    nftEventFilterEntity.timestampFrom = timestampFrom;
    nftEventFilterEntity.timestampTo = timestampTo;
    nftEventFilterEntity.from = from;
    nftEventFilterEntity.count = count;

    return nftEventFilterEntity;
}

export function createMegaWalletEventFilterEntity(eventTypes: NftTransferHistoryEventType[], timestampFrom: number, timestampTo: number, from: number, count: number): MegaWalletEventFilterEntity {
    const megaWalletEventFilterEntity = new MegaWalletEventFilterEntity();

    megaWalletEventFilterEntity.eventTypes = eventTypes;
    megaWalletEventFilterEntity.timestampFrom = timestampFrom;
    megaWalletEventFilterEntity.timestampTo = timestampTo;
    megaWalletEventFilterEntity.from = from;
    megaWalletEventFilterEntity.count = count;

    return megaWalletEventFilterEntity;
}

// both farms are the same for the purpose of fitlering for events an other statistics by id.
// Most of the data of the farm is not used so far
export const miningFarmTestEntities = [MiningFarmEntity.fromJson({
    id: '1',
    accountId: '1',
    name: 'testFarmName', // So far changing them won't affect anything
    legalName: 'testFarmNameLtd', // So far changing them won't affect anything
    primaryAccountOwnerName: 'Test Testov', // So far changing them won't affect anything
    primaryAccountOwnerEmail: 'test@test.com', // So far changing them won't affect anything
    description: 'string', // So far changing them won't affect anything
    manufacturerIds: ['1'], // So far changing them won't affect anything
    minerIds: ['1'], // So far changing them won't affect anything
    energySourceIds: ['1'], // So far changing them won't affect anything
    hashPowerInTh: 123123,
    machinesLocation: 'test location', // So far changing them won't affect anything
    profileImgUrl: 'some test url', // So far changing them won't affect anything
    coverImgUrl: 'some test url', // So far changing them won't affect anything
    farmPhotoUrls: ['some test url'], // So far changing them won't affect anything
    status: FarmStatus.APPROVED,
    maintenanceFeeInBtc: '1', // So far changing them won't affect anything
    cudosMintNftRoyaltiesPercent: 10,
    cudosResaleNftRoyaltiesPercent: 2,
    resaleFarmRoyaltiesCudosAddress: 'testCudosAddress', // So far changing them won't affect anything
    rewardsFromPoolBtcAddress: 'leftoversTestAddress', // So far changing them won't affect anything
    leftoverRewardsBtcAddress: 'testpayout', // So far changing them won't affect anything
    maintenanceFeePayoutBtcAddress: 'maintenanceTestAddress', // So far changing them won't affect anything
}),
MiningFarmEntity.fromJson({
    id: '2',
    accountId: '1',
    name: 'testFarmName', // So far changing them won't affect anything
    legalName: 'testFarmNameLtd', // So far changing them won't affect anything
    primaryAccountOwnerName: 'Test Testov', // So far changing them won't affect anything
    primaryAccountOwnerEmail: 'test@test.com', // So far changing them won't affect anything
    description: 'string', // So far changing them won't affect anything
    manufacturerIds: ['1'], // So far changing them won't affect anything
    minerIds: ['1'], // So far changing them won't affect anything
    energySourceIds: ['1'], // So far changing them won't affect anything
    hashPowerInTh: 123123,
    machinesLocation: 'test location', // So far changing them won't affect anything
    profileImgUrl: 'some test url', // So far changing them won't affect anything
    coverImgUrl: 'some test url', // So far changing them won't affect anything
    farmPhotoUrls: ['some test url'], // So far changing them won't affect anything
    status: FarmStatus.APPROVED,
    maintenanceFeeInBtc: '1', // So far changing them won't affect anything
    cudosMintNftRoyaltiesPercent: 10,
    cudosResaleNftRoyaltiesPercent: 2,
    resaleFarmRoyaltiesCudosAddress: 'testCudosAddress', // So far changing them won't affect anything
    rewardsFromPoolBtcAddress: 'leftoversTestAddress', // So far changing them won't affect anything
    leftoverRewardsBtcAddress: 'testpayout', // So far changing them won't affect anything
    maintenanceFeePayoutBtcAddress: 'maintenanceTestAddress', // So far changing them won't affect anything
}),
];

export const nftTestEntitities = [];
const nftPayoutHistoryEntities = [];
const nftOwnersPayoutHistoryEntities = [];
const addressesPayoutHistoryEntities = [];

export const chainMarketplaceTradeHistoryEntities = []
export const chainNftTransferHistoryEntities = []

// for testdenomid and tokenId 1 to 5, add 2 standard marketplace events and 1 standard nft module transfer event
// the same above is added again for custom tests, they have one denom for all  "string" and token ids "1" + i
// all events new owner/buyer is "testbuyer"
// all events new btcPricer is equal to tokenId / 10000
// all events new btcPricer is equal to tokenId / 10000
// all events new usdPrice is equal to tokenId

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

// has 5 marketplace collections (denoms)
// all collections have the same royalties, creator (cudostestfarmaddress), farmId (1), platformRoyaltiesAddress {cudostestplatformaddress}
//  farmMintRoyaltiesAddress (cudostestfarmaddress) and farmResaleRoyaltiesAddress (cudostestfarmaddress)
// denomIds are from "testdenomid1" to "testdenomid5";
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
    const nftTestEntity = new NftEntity();

    // add 1 nft per collectionId
    // each nft has different ownerId = collectionId
    // all nfts are status "MINTED"
    // each nft has acudos price = i * 100 cudos
    // each nft has hashingPower = i
    // each nft has different update and create times = zero date + days equal to collectionid - 1
    //      this is for timestamp filtering

    nftTestEntity.id = uuid;
    nftTestEntity.name = `nft${i}`;
    nftTestEntity.uri = 'someuri';
    nftTestEntity.data = 'somestring';
    nftTestEntity.hashingPower = i;
    nftTestEntity.acudosPrice = new BigNumber(`${i}00`);
    nftTestEntity.expirationDateTimestamp = new Date(2024, 10, 9).getTime();
    nftTestEntity.status = NftStatus.MINTED;
    nftTestEntity.tokenId = `${i}`;
    nftTestEntity.collectionId = i;
    nftTestEntity.creatorId = i;
    nftTestEntity.deletedAt = null;
    nftTestEntity.currentOwner = 'testowner';
    nftTestEntity.marketplaceNftId = `${i}`;
    nftTestEntity.createdAt = new Date(getZeroDatePlusDaysTimestamp(i - 1)).getTime();
    nftTestEntity.updatedAt = new Date(getZeroDatePlusDaysTimestamp(i - 1)).getTime();

    nftTestEntitities.push(nftTestEntity);

    // nftTestEntitities.push({
    //     id: uuid,
    //     name: `nft${i}`,
    //     uri: 'someuri',
    //     data: 'somestring',
    //     hashingPower: i,
    //     price: `${i}00`,
    //     expirationDate: new Date(2024, 10, 9),
    //     status: NftStatus.MINTED,
    //     tokenId: `${i}`,
    //     collectionId: i,
    //     creatorId: i,
    //     deletedAt: null,
    //     currentOwner: 'testowner',
    //     marketplaceNftId: `${i}`,
    //     createdAt: new Date(getZeroDatePlusDaysTimestamp(i - 1)),
    //     updatedAt: new Date(getZeroDatePlusDaysTimestamp(i - 1)),
    // });

    // add 1 nft payout history, 1 nftOwnerPayoutHistory and one addressPayoutHistory per NFT
    // all addresses are "testpayout"
    // all owners are "testowner"
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
        await NftRepo.bulkCreate(nftTestEntitities.map((entity) => NftEntity.toRepo(entity).toJSON()));
        const insertedNftEntities = (await NftRepo.findAll()).map((repo) => NftEntity.fromRepo(repo));
        nftTestEntitities.forEach((entity) => {
            const insertedEntity = insertedNftEntities.find((entity2) => entity.id === entity2.id);
            entity.createdAt = insertedEntity.createdAt;
            entity.updatedAt = insertedEntity.updatedAt;
            entity.deletedAt = insertedEntity.deletedAt;
        })

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
