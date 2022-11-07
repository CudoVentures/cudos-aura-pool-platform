import axios from 'axios';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
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

    async fetchMiningFarmsDetailsByIds(miningFarmIds: string[]): Promise < MiningFarmDetailsEntity[] > {
        return null;
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

    async fetchManufacturers(): Promise < ManufacturerEntity[] > {
        return null;
    }

    async approveMiningFarm(miningFarmId: string): Promise < void > {
        const { data } = await axios.patch(`/api/v1/farm/${miningFarmId}/status`, { status: 'approved' }, { headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        } })
    }
    async fetchMiners(): Promise < MinerEntity[] > {
        return null;
    }

    async fetchEnergySources(): Promise < EnergySourceEntity[] > {
        return null;
    }

    async creditManufacturer(manufacturerEntity: ManufacturerEntity): Promise < void > {
        return null;
    }

    async creditMiner(minerEntity: MinerEntity): Promise < void > {
        return null;
    }

    async creditEnergySource(energySourceEntity: EnergySourceEntity): Promise < void > {
        return null;
    }

}
