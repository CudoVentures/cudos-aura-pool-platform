import { string } from 'prop-types';
import { DatabaseError } from 'sequelize';
import { NOT_EXISTS_INT } from '../../common/utils';
import { NftStatus } from '../../nft/nft.types';
import { NftRepoColumn, NftRepo } from '../../nft/repos/nft.repo';
import { NftOwnersPayoutHistoryRepo, NftOwnersPayoutHistoryRepoColumn } from '../repos/nft-owners-payout-history.repo';
import { NftPayoutHistoryRepo, NftPayoutHistoryRepoColumn } from '../repos/nft-payout-history.repo';
import { v4 as uuidv4 } from 'uuid';

export const nftTestEntitities = [];
const nftPayoutHistoryEntities = [];
const nftOwnersPayoutHistoryEntities = [];

for (let i = 1; i <= 5; i++) {
    nftTestEntitities.push({
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
        token_id: i,
        denom_id: `denom${i}`,
        payout_period_start: getZeroDatePlusDaysTimestamp(0),
        payout_period_end: getZeroDatePlusDaysTimestamp(5),
        reward: i,
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
        reward: i,
        nft_payout_history_id: i,
        createdAt: new Date(getZeroDatePlusDaysTimestamp(i - 1)),
        updatedAt: new Date(getZeroDatePlusDaysTimestamp(i - 1)),
        sent: true,
    })
}

export async function fillStatisticsTestData() {
    try {
        await NftRepo.bulkCreate(nftTestEntitities);
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
