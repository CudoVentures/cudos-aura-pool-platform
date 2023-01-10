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
        price: `${i}00`,
        expirationDateTimestamp: (new Date(2024, 10, 9)).getDate(),
        status: NftStatus.MINTED,
        tokenId: `${i}`,
        collectionId: `${i}`,
        creatorId: `${i}`,
        currentOwner: 'testowner',
        marketplaceNftId: `${i}`,
    }));

    nftTestEntitities.push(NftEntity.fromJson({
        id: uuidv4(),
        name: `nftqueued${i}`,
        uri: 'someuri',
        data: 'somestring',
        hashingPower: i,
        price: `${i}00`,
        expirationDateTimestamp: (new Date(2024, 10, 9)).getDate(),
        status: NftStatus.QUEUED,
        tokenId: `${i}`,
        collectionId: `${i}`,
        creatorId: `${i}`,
        currentOwner: 'testowner',
        marketplaceNftId: `${i}`,
    }));
}

export default nftTestEntitities;
