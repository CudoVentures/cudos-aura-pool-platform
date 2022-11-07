import axios from 'axios';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';

const MiningFarmStatusMap = {
    queued: MiningFarmStatus.NOT_APPROVED,
    approved: MiningFarmStatus.APPROVED,
    deleted: MiningFarmStatus.DELETED,
    rejected: MiningFarmStatus.DELETED,
}

export default class MiningFarmApi {

    async fetchPopularMiningFarms(): Promise < MiningFarmEntity[] > {
        const { data } = await axios.get('/api/v1/farm')

        return data.map((farm) => MiningFarmEntity.fromJson({
            id: farm.id,
            accountId: farm.creator_id,
            name: farm.name,
            legalName: farm.sub_account_name,
            primaryAccountOwnerName: farm.id || 'name',
            primaryAccountOwnerEmail: 'mail',
            description: farm.description,
            manufacturerIds: farm.manufacturers,
            minerIds: farm.miner_types,
            energySourceIds: farm.energy_source,
            hashRateTh: farm.total_farm_hashrate,
            machinesLocation: farm.location,
            poolFee: farm.maintenance_fee_in_btc,
            status: MiningFarmStatusMap[farm.status],
        }))
    }

    async fetchMiningFarmsByIds(miningFarmIds: string[]): Promise < MiningFarmEntity[] > {
        const { data } = await axios.get('/api/v1/farm', { params: {
            ids: miningFarmIds.join(','),
        } })

        return data.map((farm) => MiningFarmEntity.fromJson({
            id: farm.id,
            accountId: farm.creator_id,
            name: farm.name,
            legalName: farm.sub_account_name,
            primaryAccountOwnerName: farm.id || 'name',
            primaryAccountOwnerEmail: 'mail',
            description: farm.description,
            manufacturerIds: farm.manufacturers,
            minerIds: farm.miner_types,
            energySourceIds: farm.energy_source,
            hashRateTh: farm.total_farm_hashrate,
            machinesLocation: farm.location,
            poolFee: farm.maintenance_fee_in_btc,
            status: MiningFarmStatusMap[farm.status],
        }))
    }

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        const { data } = await axios.get('/api/v1/farm', { params: {
            status: miningFarmFilterModel.status,
            limit: miningFarmFilterModel.count,
            ...(miningFarmFilterModel.sessionAccount && { creator_id: miningFarmFilterModel.sessionAccount }),
            offset: miningFarmFilterModel.from,
        } })

        const result = { miningFarmEntities: data.map((farm) => MiningFarmEntity.fromJson({
            id: farm.id,
            accountId: farm.creator_id,
            name: farm.name,
            legalName: farm.sub_account_name,
            primaryAccountOwnerName: farm.id || 'name',
            primaryAccountOwnerEmail: 'mail',
            description: farm.description,
            manufacturerIds: farm.manufacturers,
            minerIds: farm.miner_types,
            energySourceIds: farm.energy_source,
            hashRateTh: farm.total_farm_hashrate,
            machinesLocation: farm.location,
            poolFee: farm.maintenance_fee_in_btc,
            status: MiningFarmStatusMap[farm.status],
        })),
        total: data.length,
        }

        return result
    }

    async creditMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < MiningFarmEntity > {
        const { data: farm } = await axios.put(
            '/api/v1/farm',
            {
                ...miningFarmEntity,
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

        return MiningFarmEntity.fromJson({
            id: farm.id,
            accountId: farm.creator_id,
            name: farm.name,
            legalName: farm.sub_account_name,
            primaryAccountOwnerName: farm.id || 'name',
            primaryAccountOwnerEmail: 'mail',
            description: farm.description,
            manufacturerIds: farm.manufacturers,
            minerIds: farm.miner_types,
            energySourceIds: farm.energy_source,
            hashRateTh: farm.total_farm_hashrate,
            machinesLocation: farm.location,
            poolFee: farm.maintenance_fee_in_btc,
            status: MiningFarmStatusMap[farm.status],
        })
    }

    async fetchMiningFarmSalesStatistics(miningFarmId: string, timestamp: number): Promise < number[] > {
        return null;
    }

    async approveMiningFarm(miningFarmId: string): Promise < void > {
        const { data } = await axios.patch(`/api/v1/farm/${miningFarmId}/status`, { status: 'approved' }, { headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        } })
    }
}
