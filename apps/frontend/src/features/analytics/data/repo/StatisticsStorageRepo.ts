import BigNumber from 'bignumber.js';
import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventEntity from '../../entities/NftEventEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import UserEarningsEntity from '../../entities/UserEarningsEntity';
import StatisticsRepo from '../../presentation/repos/StatisticsRepo';

export default class StatisticsStorageRepo implements StatisticsRepo {

    async fetchNftEvents(nftEventFilterModel: NftEventFilterModel): Promise < { nftEventEntities: NftEventEntity[], total: number } > {
        const nftEventEntities = [];

        for (let i = 0; i < 21; ++i) {
            const nftEventEntity = new NftEventEntity();
            nftEventEntities.push(nftEventEntity);
            nftEventEntity.nftEventId = `${i + 1}`;
            nftEventEntity.nftId = '1';
            nftEventEntity.fromAddress = 'cudos1veuwr0t46fknaymy2q6yzmhcn2e0kfmdftsnws';
            nftEventEntity.toAddress = 'cudos1veuwr0t46fknaymy2q6yzmhcn2e0kfmdftsnws';
            nftEventEntity.transferPriceInCudos = new BigNumber(1000);
            nftEventEntity.transferPriceUsd = 10;
            nftEventEntity.quantity = 1;
            nftEventEntity.timestamp = Date.now();
        }

        return {
            nftEventEntities: nftEventEntities.slice(nftEventFilterModel.from, nftEventFilterModel.from + nftEventFilterModel.count),
            total: nftEventEntities.length,
        }
    }

    async fetchNftEarningsBySessionAccount(timestampFrom: number, timestampTo: number): Promise < UserEarningsEntity > {
        const userEarningsEntity = new UserEarningsEntity();

        userEarningsEntity.totalBtcEarningInUsd = 3451;
        userEarningsEntity.totalNftBounght = 34;
        userEarningsEntity.totalContractHashPower = 104135;
        userEarningsEntity.totalContractHashPowerInUsd = 34124;
        userEarningsEntity.earningsPerDayInUsd = [100, 32, 231, 511, 531, 81];
        userEarningsEntity.btcEarnedInBtc = new BigNumber(0.321);
        userEarningsEntity.btcEarnedInUsd = 4145;

        return userEarningsEntity;
    }

    async fetchNftEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number): Promise < NftEarningsEntity > {
        const nftEarningsEntity = new NftEarningsEntity();

        nftEarningsEntity.earningsPerDayInBtc = [new BigNumber(100), new BigNumber(32), new BigNumber(231), new BigNumber(511), new BigNumber(531), new BigNumber(81)];

        return nftEarningsEntity;
    }

    async fetchNftEarningsByMiningFarmId(miningFarmId: string, timestampFrom: number, timestampTo: number): Promise < MiningFarmEarningsEntity > {
        const miningFarmEarningsEntity = new MiningFarmEarningsEntity();

        miningFarmEarningsEntity.totalFarmSalesInUsd = 4125;
        miningFarmEarningsEntity.totalNftSold = 41;
        miningFarmEarningsEntity.maintenanceFeeDepositedInCudos = new BigNumber(4120);
        miningFarmEarningsEntity.maintenanceFeeDepositedInUsd = 41.2;
        miningFarmEarningsEntity.earningsPerDayInUsd = [100, 32, 231, 511, 531, 81];

        return miningFarmEarningsEntity
    }

}
