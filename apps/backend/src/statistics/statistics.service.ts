import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import BigNumber from 'bignumber.js';
import { Op } from 'sequelize';
import UserEntity from '../account/entities/user.entity';
import { CollectionService } from '../collection/collection.service';
import CollectionFilterEntity from '../collection/entities/collection-filter.entity';
import { IntBoolValue } from '../common/utils';
import { GraphqlService } from '../graphql/graphql.service';
import NftFilterEntity from '../nft/entities/nft-filter.entity';
import NftEntity from '../nft/entities/nft.entity';
import { NFTService } from '../nft/nft.service';
import MiningFarmEarningsEntity from './entities/mining-farm-earnings.entity';
import NftEarningsEntity from './entities/nft-earnings.entity';
import NftEventFilterEntity from './entities/nft-event-filter.entity';
import { TransferHistoryEntity } from './entities/transfer-history.entity';
import UserEarningsEntity from './entities/user-earnings.entity';
import { NftOwnersPayoutHistory } from './models/nft-owners-payout-history.model';
import { NftPayoutHistory } from './models/nft-payout-history.model';
import { dayInMs, getDays } from './utils';

@Injectable()
export class StatisticsService {
    constructor(
        private nftService: NFTService,
        private collectionService: CollectionService,
        private graphqlService: GraphqlService,
        @InjectModel(NftPayoutHistory)
        private nftPayoutHistoryModel: typeof NftPayoutHistory,
        @InjectModel(NftOwnersPayoutHistory)
        private nftOwnersPayoutHistoryModel: typeof NftOwnersPayoutHistory,
    // eslint-disable-next-line no-empty-function
    ) {}

    async fetchNftEventsByFilter(userEntity: UserEntity, nftEventFilterEntity: NftEventFilterEntity): Promise<{ nftEventEntities: TransferHistoryEntity[], total: number }> {
        const nftFilterEntity = new NftFilterEntity();

        if (nftEventFilterEntity.isBySessionAccount() === true) {
            nftFilterEntity.sessionAccount = IntBoolValue.TRUE;
        }

        if (nftEventFilterEntity.isByNftId()) {
            nftFilterEntity.nftIds = [nftEventFilterEntity.nftId];
        }
        // TODO fetch by event type

        nftFilterEntity.from = nftEventFilterEntity.from;
        nftFilterEntity.count = nftEventFilterEntity.count;

        const { nftEntities } = await this.nftService.findByFilter(userEntity, nftFilterEntity)

        const collectionFilter = new CollectionFilterEntity();
        collectionFilter.collectionIds = nftEntities.map((nftEntity) => nftEntity.collectionId.toString());
        const { collectionEntities } = await this.collectionService.findByFilter(collectionFilter);

        const denomIdTokenIdsMap = new Map<string, string[]>();

        collectionEntities.forEach((collectionEntity) => {
            const denomId = collectionEntity.denomId;
            const nftEntitiesForCollection = nftEntities.filter((nftEntity) => nftEntity.collectionId === collectionEntity.id);

            if (nftEntitiesForCollection.length === 0) {
                throw Error('Some problem with relations collectionId and nft');
            }

            denomIdTokenIdsMap.set(denomId, nftEntitiesForCollection.map((nftEntity) => nftEntity.id));
        });

        const history: TransferHistoryEntity[] = [];

        const nftTransferHistory = await this.graphqlService.fetchNftTransferHistory(denomId, tokenIds);
        const nftTradeHistory = await this.graphqlService.fetchMarketplaceNftTradeHistory(denomId, tokenIds);

        nftTransferHistory.forEach((transfer) => {
            let eventType = 'transfer';
            if (transfer.old_owner == '0x0') {
                eventType = 'mint';
            }

            history.push({
                nftId: uid,
                from: transfer.old_owner,
                to: transfer.new_owner,
                hashing_power,
                timestamp: transfer.timestamp,
                eventType,
            });
        });

        nftTradeHistory.forEach((trade) => {
            let eventType = 'sale';
            if (trade.seller = '0x0') {
                eventType = 'mint';
            }

            history.push({
                nftId: uid,
                from: trade.seller,
                to: trade.buyer,
                timestamp: trade.timestamp,
                btcPrice: trade.btc_price,
                usdPrice: trade.usd_price,
                acudosPrice: trade.price,
                eventType,
            });
        });

        history.sort((a, b) => ((a.timestamp > b.timestamp) ? 1 : -1))
    }

    async fetchEarningsByCudosAddress(cudosAddress: string, timestampFrom: number, timestampTo: number): Promise < UserEarningsEntity > {
        const days = getDays(Number(timestampFrom), Number(timestampTo))

        const ownerPayoutHistoryForPeriod = await this.nftOwnersPayoutHistoryModel.findAll({
            where: {
                owner: cudosAddress,
            },
            include: [{ model: NftPayoutHistory,
                where: {
                    payout_period_start: {
                        [Op.gte]: timestampFrom / 1000,
                    },
                    payout_period_end: {
                        [Op.lte]: timestampTo / 1000,
                    },
                },
            }],
        })
        const rewardsPerDay = days.map((day) => ownerPayoutHistoryForPeriod.filter((row) => (row.nft_payout_history.payout_period_start * 1000) >= day && (row.nft_payout_history.payout_period_end * 1000) <= day + dayInMs).reduce((prevVal, currVal) => prevVal + Number(currVal.reward), 0))

        const ownerPayoutHistory = await this.nftOwnersPayoutHistoryModel.findAll({
            where: {
                owner: cudosAddress,
            },
        })
        const totalEarningInBtc = ownerPayoutHistory.reduce((prevVal, currVal) => prevVal + Number(currVal.reward), 0)

        const totalNftsOwned = await this.graphqlService.fetchTotalNftsByAddress(cudosAddress)

        const userEarningsEntity = new UserEarningsEntity();
        userEarningsEntity.totalEarningInBtc = new BigNumber(totalEarningInBtc);
        userEarningsEntity.totalNftBought = totalNftsOwned;
        userEarningsEntity.earningsPerDayInUsd = rewardsPerDay;
        userEarningsEntity.btcEarnedInBtc = new BigNumber(0);

        return userEarningsEntity;
        // return {
        //     totalEarningInBtc,
        //     totalNftBought: totalNftsOwned,
        //     earningsPerDayInUsd: rewardsPerDay,
        //     btcEarnedInBtc: 0,
        // }
    }

    async fetchEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number): Promise < NftEarningsEntity > {
        const nftEntity = await this.nftService.findOne(nftId)
        const collectionEntity = await this.collectionService.findOne(nftEntity.collectionId);
        const tokenId = nftEntity.tokenId;
        const denomId = collectionEntity.denomId;

        const days = getDays(Number(timestampFrom), Number(timestampTo))

        if (!tokenId) {
            return new NftEarningsEntity();
        }
        const payoutHistory = await this.nftPayoutHistoryModel.findAll({ where: {
            token_id: tokenId,
            denom_id: denomId,
            payout_period_start: {
                [Op.gte]: Number(timestampFrom) / 1000,

            },
            payout_period_end: {
                [Op.lte]: Number(timestampTo) / 1000,
            },
        } })

        const rewardsPerDay = days.map(((day) => payoutHistory.find((row) => (row.payout_period_start * 1000) >= day && (row.payout_period_end * 1000) <= day + dayInMs)?.reward.toString() || null))

        const nftEarningsEntity = new NftEarningsEntity();
        nftEarningsEntity.earningsPerDayInBtc = rewardsPerDay.map((s) => new BigNumber(s));
        return nftEarningsEntity;
    }

    async fetchEarningsByMiningFarmId(miningFarmId: number, timestampFrom: number, timestampTo: number): Promise < MiningFarmEarningsEntity > {
        const days = getDays(Number(timestampFrom), Number(timestampTo))

        const collections = await this.collectionService.findByFarmId(miningFarmId)
        const tempNftFilterEntity = new NftFilterEntity();
        tempNftFilterEntity.collectionIds = collections.map((collection) => collection.id.toString())
        const { nftEntities } = await this.nftService.findByFilter(null, tempNftFilterEntity);

        const nfts = (await Promise.all(nftEntities)).flat().filter((nft) => nft.tokenId !== '')

        const totalFarmSales = await this.graphqlService.fetchCollectionTotalSales(collections.map((collection) => collection.denomId))

        const nftsWithPayoutHistoryForPeriod = await Promise.all(nfts.map(async (nft) => {
            const payoutHistoryForPeriod = await this.nftPayoutHistoryModel.findAll({ where: {
                tokenId: nft.tokenId,
                denomId: collections.find((collection) => collection.id === nft.collectionId).denomId,
                payout_period_start: {
                    [Op.gte]: Number(timestampFrom) / 1000,
                },
                payout_period_end: {
                    [Op.lte]: Number(timestampTo) / 1000,
                },
            } })

            const nftMaintenanceFeeForPeriod = payoutHistoryForPeriod.reduce((prevValue, currValue) => prevValue + currValue.maintenance_fee, 0)
            return {
                ...NftEntity.toJson(nft),
                nftMaintenanceFeeForPeriod,
                payoutHistoryForPeriod,
            }
        }))

        const maintenanceFeeDepositedInBtc = nftsWithPayoutHistoryForPeriod.reduce((prevValue, currValue) => prevValue + currValue.nftMaintenanceFeeForPeriod, 0)

        const earningsPerDayInUsd = days.map((day) => {
            let earningsForDay = 0

            nftsWithPayoutHistoryForPeriod.map((nft) => nft.payoutHistoryForPeriod.forEach((nftPayoutHistory) => {
                if ((nftPayoutHistory.payout_period_start * 1000) >= day && (nftPayoutHistory.payout_period_end * 1000) <= day + dayInMs) {
                    earningsForDay += Number(nftPayoutHistory.reward)
                }
            }))

            return earningsForDay
        })

        const miningFarmEarningsEntity = new MiningFarmEarningsEntity();
        miningFarmEarningsEntity.totalMiningFarmSalesInAcudos = new BigNumber(totalFarmSales.salesInAcudos || 0);
        miningFarmEarningsEntity.totalNftSold = nfts.length;
        // miningFarmEarningsEntity.totalMiningFarmSalesInUsd = totalFarmSales.salesInUsd || 0;
        miningFarmEarningsEntity.maintenanceFeeDepositedInBtc = new BigNumber(maintenanceFeeDepositedInBtc);
        miningFarmEarningsEntity.earningsPerDayInUsd = earningsPerDayInUsd;

        return miningFarmEarningsEntity;
    }
}
