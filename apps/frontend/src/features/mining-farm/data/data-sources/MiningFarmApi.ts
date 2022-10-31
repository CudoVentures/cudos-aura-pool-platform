import axios from 'axios';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';

export default class MiningFarmApi {

    async fetchPopularMiningFarms(): Promise < MiningFarmEntity[] > {
        return null;
    }

    async fetchMiningFarmsByIds(miningFarmIds: string[]): Promise < MiningFarmEntity[] > {
        const { data } = await axios.get('/api/v1/farm', { params: {
            id: miningFarmIds.join(','),
        } })

        return data
    }

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        const { data } = await axios.get('/api/v1/farm', { params: {
            ...miningFarmFilterModel,
        } })

        return data
    }

    async creditMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < MiningFarmEntity > {
        const { data } = await axios.post(
            '/api/v1/farm',
            {
                name: miningFarmEntity.name,
                description: miningFarmEntity.description,
                sub_account_name: miningFarmEntity.legalName,
                location: miningFarmEntity.machinesLocation,
                address_for_receiving_rewards_from_pool: 'address_for_receiving_rewards_from_pool',
                leftover_reward_payout_address: 'leftover_reward_payout_address',
                maintenance_fee_payout_address: 'maintenance_fee_payout_address',
                maintenance_fee_in_btc: miningFarmEntity.poolFee,
                total_farm_hashrate: miningFarmEntity.hashRateTh,
                manufacturers: miningFarmEntity.manufacturerIds,
                miner_types: miningFarmEntity.minerIds,
                energy_source: miningFarmEntity.energySourceIds,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            },
        )

        return data
    }

    async fetchMiningFarmSalesStatistics(miningFarmId: string, timestamp: number): Promise < number[] > {
        return null;
    }
}
