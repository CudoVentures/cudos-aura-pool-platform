import { string } from 'prop-types';
import { DatabaseError } from 'sequelize';
import { NOT_EXISTS_INT } from '../../common/utils';
import { NftStatus } from '../../nft/nft.types';
import { NftRepoColumn, NftRepo } from '../../nft/repos/nft.repo';
import { NftOwnersPayoutHistoryRepo, NftOwnersPayoutHistoryRepoColumn } from '../repos/nft-owners-payout-history.repo';
import { NftPayoutHistoryRepo, NftPayoutHistoryRepoColumn } from '../repos/nft-payout-history.repo';
import { v4 as uuidv4 } from 'uuid';

const nftEntitities = [];
const nftPayoutHistoryEntities = [];
const nftOwnersPayoutHistoryEntities = [];

for (let i = 1; i <= 5; i++) {
    nftEntitities.push({
        id: uuidv4(),
        name: `nft${i}`,
        uri: 'someuri',
        data: 'somestring',
        hashingPower: i,
        price: `${i}00`,
        expirationDate: new Date(),
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
        tokenId: i,
        denomId: `denom${i}`,
        payoutPeriodStart: getZeroDatePlusDaysTimestamp(0),
        payoutPeriodEnd: getZeroDatePlusDaysTimestamp(5),
        reward: i,
        txHash: `txhash${i}`,
        maintenanceFee: i,
        cudoPartOfMaintenanceFee: i,
        createdAt: getZeroDatePlusDaysTimestamp(0),
        updatedAt: getZeroDatePlusDaysTimestamp(0),
    });

    nftOwnersPayoutHistoryEntities.push({
        id: i,
        timeOwnedFrom: i,
        timeOwnedTo: i,
        totalTimeOwned: i,
        percentOftimeOwned: i,
        owner: 'testowner',
        payoutAddress: 'testpayout',
        reward: i,
        nftPayoutHistoryId: i,
        createdAt: getZeroDatePlusDaysTimestamp(0),
        updatedAt: getZeroDatePlusDaysTimestamp(0),
        sent: true,
    })
}

export async function fillStatisticsTestData() {
    try {
        await NftRepo.bulkCreate(nftEntitities);
        await NftPayoutHistoryRepo.bulkCreate(nftPayoutHistoryEntities);
        await NftOwnersPayoutHistoryRepo.bulkCreate(nftOwnersPayoutHistoryEntities);
    } catch (e) {
        console.log(e);
    }
}

export async function emptyStatisticsTestData() {
    await NftRepo.truncate({ cascade: true });
    await NftPayoutHistoryRepo.truncate({ cascade: true });
    await NftOwnersPayoutHistoryRepo.truncate({ cascade: true });
}

export function getZeroDatePlusDaysTimestamp(numberOfDaysToAdd: number): number {
    const zeroDate = new Date(0);
    const result = zeroDate.setDate(zeroDate.getDate() + numberOfDaysToAdd);

    return result;
}
