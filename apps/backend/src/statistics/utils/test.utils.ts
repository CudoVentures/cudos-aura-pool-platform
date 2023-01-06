import { DatabaseError } from 'sequelize';
import { NftOwnersPayoutHistoryRepo, NftOwnersPayoutHistoryRepoColumn } from '../repos/nft-owners-payout-history.repo';
import { NftPayoutHistoryRepo, NftPayoutHistoryRepoColumn } from '../repos/nft-payout-history.repo';

const nftPayoutHistoryEntities = [];
const nftOwnersPayoutHistoryEntities = [];

for (let i = 0; i <= 5; i++) {
    const date = new Date(i);
    nftPayoutHistoryEntities.push({
        [NftPayoutHistoryRepoColumn.ID]: i,
        [NftPayoutHistoryRepoColumn.TOKEN_ID]: i,
        [NftPayoutHistoryRepoColumn.DENOM_ID]: `denom${i}`,
        [NftPayoutHistoryRepoColumn.PAYOUT_PERIOD_START]: i,
        [NftPayoutHistoryRepoColumn.PAYOUT_PERIOD_END]: i,
        [NftPayoutHistoryRepoColumn.REWARD]: i,
        [NftPayoutHistoryRepoColumn.TX_HASH]: `txhash${i}`,
        [NftPayoutHistoryRepoColumn.MAINTENANCE_FEE]: i,
        [NftPayoutHistoryRepoColumn.CUDO_PART_OF_MAINTENANCE_FEE]: i,
        [NftPayoutHistoryRepoColumn.CREATED_AT]: (new Date()).setDate(date.getDate() + 1),
        [NftPayoutHistoryRepoColumn.UPDATED_AT]: (new Date()).setDate(date.getDate() + 1),
    });

    nftOwnersPayoutHistoryEntities.push({
        [NftOwnersPayoutHistoryRepoColumn.ID]: i,
        [NftOwnersPayoutHistoryRepoColumn.TIME_OWNED_FROM]: i,
        [NftOwnersPayoutHistoryRepoColumn.TIME_OWNED_TO]: i,
        [NftOwnersPayoutHistoryRepoColumn.TOTAL_TIME_OWNED]: i,
        [NftOwnersPayoutHistoryRepoColumn.PERCENT_OF_TIME_OWNED]: i,
        [NftOwnersPayoutHistoryRepoColumn.OWNER]: `cudosowner${i}`,
        [NftOwnersPayoutHistoryRepoColumn.PAYOUT_ADDRESS]: `cudospayout${i}`,
        [NftOwnersPayoutHistoryRepoColumn.REWARD]: i,
        [NftOwnersPayoutHistoryRepoColumn.NFT_PAYOUT_HISTORY_ID]: i,
        [NftOwnersPayoutHistoryRepoColumn.CREATED_AT]: (new Date()).setDate(date.getDate() + 1),
        [NftOwnersPayoutHistoryRepoColumn.UPDATED_AT]: (new Date()).setDate(date.getDate() + 1),
        [NftOwnersPayoutHistoryRepoColumn.SENT]: true,
    })
}

export async function fillStatisticsTestData() {
    await NftPayoutHistoryRepo.bulkCreate(nftPayoutHistoryEntities);
    await NftOwnersPayoutHistoryRepo.bulkCreate(nftOwnersPayoutHistoryEntities);
}

export async function emptyStatisticsTestData() {
    await NftPayoutHistoryRepo.truncate({ cascade: true });
    await NftOwnersPayoutHistoryRepo.truncate({ cascade: true });
}
