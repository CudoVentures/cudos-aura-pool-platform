import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import axios from '../../../../core/utilities/AxiosWrapper';

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
            machinesLocation: farm.location,
            poolFee: farm.maintenance_fee_in_btc,
            status: MiningFarmStatusMap[farm.status],
            hashPowerInTh: farm.total_farm_hashrate,
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
            hashPowerInTh: farm.total_farm_hashrate,
        }))
    }

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        const { data } = await axios.get('/api/v1/farm', { params: {
            status: miningFarmFilterModel.status,
            limit: miningFarmFilterModel.count,
            ...(miningFarmFilterModel.sessionAccount && { creator_id: miningFarmFilterModel.sessionAccount }),
            offset: miningFarmFilterModel.from,
            ...(miningFarmFilterModel.miningFarmIds && { ids: miningFarmFilterModel.miningFarmIds.join(',') }),
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
            hashPowerInTh: farm.total_farm_hashrate,
        })),
        total: data.length,
        }

        return result
    }

    async fetchMiningFarmsDetailsByIds(miningFarmIds: string[]): Promise < MiningFarmDetailsEntity[] > {
        const { data } = await axios.get('/api/v1/farm/details', { params: {
            ids: miningFarmIds.join(','),
        } })

        return data.map((farm) => MiningFarmDetailsEntity.fromJson({
            miningFarmId: farm.id,
            nftsOwned: farm.nftsOwned,
            totalNftsSold: farm.nftsSold,
            activeWorkers: farm.activeWorkers,
            averageHashRateInTh: farm.averageHashRate,
        }))
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
                total_farm_hashrate: miningFarmEntity.hashPowerInTh,
                manufacturers: miningFarmEntity.manufacturerIds,
                miner_types: miningFarmEntity.minerIds,
                energy_source: miningFarmEntity.energySourceIds,
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
            hashPowerInTh: farm.total_farm_hashrate,
            machinesLocation: farm.location,
            poolFee: farm.maintenance_fee_in_btc,
            status: MiningFarmStatusMap[farm.status],
        })
    }

    async approveMiningFarm(miningFarmId: string): Promise < void > {
        const { data } = await axios.patch(`/api/v1/farm/${miningFarmId}/status`, { status: 'approved' });
    }

    async fetchManufacturers(): Promise < ManufacturerEntity[] > {
        const { data } = await axios.get('/api/v1/farm/manufacturers')

        return data.map((manufacturer) => ManufacturerEntity.fromJson({
            manufacturerId: manufacturer.id,
            name: manufacturer.name,
        }))
    }

    async fetchMiners(): Promise < MinerEntity[] > {
        const { data } = await axios.get('/api/v1/farm/miners')

        return data.map((miner) => MinerEntity.fromJson({
            minerId: miner.id,
            name: miner.name,
        }))
    }

    async fetchEnergySources(): Promise < EnergySourceEntity[] > {
        const { data } = await axios.get('/api/v1/farm/energy-sources')

        return data.map((energySource) => EnergySourceEntity.fromJson({
            energySourceId: energySource.id,
            name: energySource.name,
        }))
    }

    async creditManufacturer(manufacturerEntity: ManufacturerEntity): Promise < void > {
        await axios.put('/api/v1/farm/manufacturers', {
            id: Number(manufacturerEntity.manufacturerId),
            name: manufacturerEntity.name,
        })
    }

    async creditMiner(minerEntity: MinerEntity): Promise < void > {
        await axios.put('/api/v1/farm/miners', {
            id: Number(minerEntity.minerId),
            name: minerEntity.name,
        })
    }

    async creditEnergySource(energySourceEntity: EnergySourceEntity): Promise < void > {
        await axios.put('/api/v1/farm/energy-sources', {
            id: Number(energySourceEntity.energySourceId),
            name: energySourceEntity.name,
        })
    }

}
