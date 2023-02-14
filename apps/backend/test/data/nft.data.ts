import { v4 as uuidv4 } from 'uuid';
import { NOT_EXISTS_INT } from '../../src/common/utils';
import NftEntity from '../../src/nft/entities/nft.entity';
import { NftStatus } from '../../src/nft/nft.types';

const nftTestEntitities = [];

for (let i = 1; i <= 8; i++) {
    nftTestEntitities.push(NftEntity.fromJson({
        id: uuidv4(),
        name: `nft${i}`,
        uri: 'someuri',
        data: 'somestring',
        hashingPower: i,
        priceInAcudos: `${i}00`,
        priceUsd: i,
        expirationDateTimestamp: (new Date(2024, 10, 9)).getDate(),
        status: NftStatus.MINTED,
        tokenId: `${i}`,
        collectionId: `${i}`,
        creatorId: `${i}`,
        currentOwner: 'testowner',
        marketplaceNftId: `${i}`,
        priceAcudosValidUntil: 1676363186163,
        deletedAt: 1676363186163,
        createdAt: 1676363186163,
        updatedAt: 1676363186163,
    }));

    nftTestEntitities.push(NftEntity.fromJson({
        id: uuidv4(),
        name: `nftqueued${i}`,
        uri: 'someuri',
        data: 'somestring',
        hashingPower: i,
        priceInAcudos: `${i}00`,
        priceUsd: i,
        expirationDateTimestamp: (new Date(2024, 10, 9)).getDate(),
        status: NftStatus.QUEUED,
        tokenId: `${i}`,
        collectionId: `${i}`,
        creatorId: `${i}`,
        currentOwner: 'testowner',
        marketplaceNftId: `${i}`,
        priceAcudosValidUntil: 1676363186163,
        deletedAt: 1676363186163,
        createdAt: 1676363186163,
        updatedAt: 1676363186163,
    }));
}

export default nftTestEntitities;
