import { v4 as uuidv4 } from 'uuid';
import { NOT_EXISTS_INT } from '../../src/common/utils';
import NftEntity from '../../src/nft/entities/nft.entity';
import { NftStatus } from '../../src/nft/nft.types';
import { getZeroDatePlusDaysTimestamp } from '../../src/statistics/utils/test.utils';

const nftTestEntitities = [];

// for each collection  - 1 minted nft and one queued
// total 16 nfts - 8 minted
// all nfts have unique ids
// each nft has hash power, equal to the collection id - 1, 2 ...8
// each nft has priceInAcudos, equal to the collection id * 100 - 100, 200 ...800
// each nft has priceUsdr 100
// tokenId equals collectionId
// creatorId equals collectionId
// marketplaceNftId equals collectionId
// all nfts owner = "testowner"
// each nft priceAcudosValidUntil is days passed from zero date to colelctionId - 1 + some time for valid price
//      so nftId = 1 has zero date timestamp + some value so to be valid
// each nft createdAt is days passed from zero date to colelctionId - 1
// each nft updatedAt is days passed from zero date to colelctionId - 1
for (let i = 1; i <= 8; i++) {
    nftTestEntitities.push(NftEntity.fromJson({
        id: uuidv4(),
        name: `nft${i}`,
        uri: 'someuri', // So far changing them won't affect anything
        data: 'somestring', // So far changing them won't affect anything
        hashingPower: i,
        priceInAcudos: `${i}00`,
        priceUsd: 100,
        expirationDateTimestamp: (new Date(2024, 10, 9)).getDate(),
        status: NftStatus.MINTED,
        tokenId: `${i}`,
        collectionId: `${i}`,
        creatorId: `${i}`,
        currentOwner: 'testowner',
        marketplaceNftId: `${i}`,
        deletedAt: NOT_EXISTS_INT,
        priceAcudosValidUntil: getZeroDatePlusDaysTimestamp(i - 1) + 1000000000,
        createdAt: getZeroDatePlusDaysTimestamp(i - 1),
        updatedAt: getZeroDatePlusDaysTimestamp(i - 1),
    }));

    nftTestEntitities.push(NftEntity.fromJson({
        id: uuidv4(),
        name: `nftqueued${i}`,
        uri: 'someuri', // So far changing them won't affect anything
        data: 'somestring', // So far changing them won't affect anything
        hashingPower: i,
        priceInAcudos: `${i}00`,
        priceUsd: 100,
        expirationDateTimestamp: (new Date(2024, 10, 9)).getDate(),
        status: NftStatus.QUEUED,
        tokenId: '',
        collectionId: `${i}`,
        creatorId: `${i}`,
        currentOwner: 'testowner',
        marketplaceNftId: `${i}`,
        deletedAt: NOT_EXISTS_INT,
        priceAcudosValidUntil: getZeroDatePlusDaysTimestamp(i - 1) + 1000000000,
        createdAt: getZeroDatePlusDaysTimestamp(i - 1),
        updatedAt: getZeroDatePlusDaysTimestamp(i - 1),
    }));
}

export default nftTestEntitities;

const nftPresaleEntities = [];

// total 50000 nfts - 10000 minted, 40000 queued
// each tier - 10000 nfts
// tier5 is all minted
// names
// all nfts have unique ids
// each nft has hash power, equal to the collection id - 1, 2 ...8
// each nft has priceInAcudos, equal to the collection id * 100 - 100, 200 ...800
// each nft has priceUsdr 100
// tokenId equals collectionId
// creatorId equals collectionId
// marketplaceNftId equals collectionId
// all nfts owner = "testowner"
// each nft priceAcudosValidUntil is days passed from zero date to colelctionId - 1 + some time for valid price
//      so nftId = 1 has zero date timestamp + some value so to be valid
// each nft createdAt is days passed from zero date to colelctionId - 1
// each nft updatedAt is days passed from zero date to colelctionId - 1
for (let i = 1; i <= 10000; i++) {
    nftPresaleEntities.push(NftEntity.fromJson({
        id: uuidv4(),
        name: `tier5_${i}`,
        uri: 'someuri', // So far changing them won't affect anything
        data: 'somestring', // So far changing them won't affect anything
        hashingPower: i,
        priceInAcudos: `${i}00`,
        priceUsd: 300,
        expirationDateTimestamp: (new Date(2024, 10, 9)).getDate(),
        status: NftStatus.MINTED,
        tokenId: `${i}`,
        collectionId: '1',
        creatorId: `${i}`,
        currentOwner: 'testowner',
        marketplaceNftId: `${i}`,
        deletedAt: NOT_EXISTS_INT,
        priceAcudosValidUntil: getZeroDatePlusDaysTimestamp(i - 1) + 1000000000,
        createdAt: getZeroDatePlusDaysTimestamp(i - 1),
        updatedAt: getZeroDatePlusDaysTimestamp(i - 1),
    }));

    nftPresaleEntities.push(NftEntity.fromJson({
        id: uuidv4(),
        name: `tier4_${i}`,
        uri: 'someuri', // So far changing them won't affect anything
        data: 'somestring', // So far changing them won't affect anything
        hashingPower: i,
        priceInAcudos: `${i}00`,
        priceUsd: 500,
        expirationDateTimestamp: (new Date(2024, 10, 9)).getDate(),
        status: NftStatus.QUEUED,
        tokenId: `${i}`,
        collectionId: '1',
        creatorId: `${i}`,
        currentOwner: 'testowner',
        marketplaceNftId: `${i}`,
        deletedAt: NOT_EXISTS_INT,
        priceAcudosValidUntil: getZeroDatePlusDaysTimestamp(i - 1) + 1000000000,
        createdAt: getZeroDatePlusDaysTimestamp(i - 1),
        updatedAt: getZeroDatePlusDaysTimestamp(i - 1),
    }));

    nftPresaleEntities.push(NftEntity.fromJson({
        id: uuidv4(),
        name: `tier3_${i}`,
        uri: 'someuri', // So far changing them won't affect anything
        data: 'somestring', // So far changing them won't affect anything
        hashingPower: i,
        priceInAcudos: `${i}00`,
        priceUsd: 1000,
        expirationDateTimestamp: (new Date(2024, 10, 9)).getDate(),
        status: NftStatus.QUEUED,
        tokenId: `${i}`,
        collectionId: '1',
        creatorId: `${i}`,
        currentOwner: 'testowner',
        marketplaceNftId: `${i}`,
        deletedAt: NOT_EXISTS_INT,
        priceAcudosValidUntil: getZeroDatePlusDaysTimestamp(i - 1) + 1000000000,
        createdAt: getZeroDatePlusDaysTimestamp(i - 1),
        updatedAt: getZeroDatePlusDaysTimestamp(i - 1),
    }));

    nftPresaleEntities.push(NftEntity.fromJson({
        id: uuidv4(),
        name: `tier2_${i}`,
        uri: 'someuri', // So far changing them won't affect anything
        data: 'somestring', // So far changing them won't affect anything
        hashingPower: i,
        priceInAcudos: `${i}00`,
        priceUsd: 2000,
        expirationDateTimestamp: (new Date(2024, 10, 9)).getDate(),
        status: NftStatus.QUEUED,
        tokenId: `${i}`,
        collectionId: '1',
        creatorId: `${i}`,
        currentOwner: 'testowner',
        marketplaceNftId: `${i}`,
        deletedAt: NOT_EXISTS_INT,
        priceAcudosValidUntil: getZeroDatePlusDaysTimestamp(i - 1) + 1000000000,
        createdAt: getZeroDatePlusDaysTimestamp(i - 1),
        updatedAt: getZeroDatePlusDaysTimestamp(i - 1),
    }));

    nftPresaleEntities.push(NftEntity.fromJson({
        id: uuidv4(),
        name: `tier1_${i}`,
        uri: 'someuri', // So far changing them won't affect anything
        data: 'somestring', // So far changing them won't affect anything
        hashingPower: i,
        priceInAcudos: `${i}00`,
        priceUsd: 3000,
        expirationDateTimestamp: (new Date(2024, 10, 9)).getDate(),
        status: NftStatus.QUEUED,
        tokenId: `${i}`,
        collectionId: '1',
        creatorId: `${i}`,
        currentOwner: 'testowner',
        marketplaceNftId: `${i}`,
        deletedAt: NOT_EXISTS_INT,
        priceAcudosValidUntil: getZeroDatePlusDaysTimestamp(i - 1) + 1000000000,
        createdAt: getZeroDatePlusDaysTimestamp(i - 1),
        updatedAt: getZeroDatePlusDaysTimestamp(i - 1),
    }));
}

export { nftPresaleEntities };
