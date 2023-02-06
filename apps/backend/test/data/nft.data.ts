import { v4 as uuidv4 } from 'uuid';
import { NOT_EXISTS_INT } from '../../src/common/utils';
import NftEntity from '../../src/nft/entities/nft.entity';
import { NftStatus } from '../../src/nft/nft.types';
import { getZeroDatePlusDaysTimestamp } from '../../src/statistics/utils/test.utils';

const nftTestEntitities = [];

for (let i = 1; i <= 8; i++) {
    nftTestEntitities.push(NftEntity.fromJson({
        id: uuidv4(),
        name: `nft${i}`,
        uri: 'someuri',
        data: 'somestring',
        hashingPower: i,
        priceInAcudos: `${i}00`,
        priceInEth: `${i}00`,
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
        uri: 'someuri',
        data: 'somestring',
        hashingPower: i,
        priceInAcudos: `${i}00`,
        priceInEth: `${i}00`,
        priceUsd: 100,
        expirationDateTimestamp: (new Date(2024, 10, 9)).getDate(),
        status: NftStatus.QUEUED,
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
}

export default nftTestEntitities;
