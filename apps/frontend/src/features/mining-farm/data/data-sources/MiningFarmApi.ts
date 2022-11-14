import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import axios from '../../../../core/utilities/AxiosWrapper';

export default class MiningFarmApi {

    async fetchPopularMiningFarms(): Promise < MiningFarmEntity[] > {
        const { data } = await axios.get('/api/v1/farm')

        return data.map((farm) => {
            // TODO: remove, they should come from backend
            farm.primary_account_owner_name = 'name';
            farm.primary_account_owner_email = 'email';
            farm.farm_photos = [];

            return MiningFarmEntity.fromJson(farm)
        })
    }

    async fetchMiningFarmsByIds(miningFarmIds: string[]): Promise < MiningFarmEntity[] > {
        const { data } = await axios.get('/api/v1/farm', { params: {
            ids: miningFarmIds.join(','),
        } })

        return data.map((farm) => {
            // TODO: remove, they should come from backend
            farm.primary_account_owner_name = 'name';
            farm.primary_account_owner_email = 'email';
            farm.farm_photos = [];

            return MiningFarmEntity.fromJson(farm)
        })
    }

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        const { data } = await axios.get('/api/v1/farm', { params: MiningFarmFilterModel.toJson(miningFarmFilterModel) });
        const result = { miningFarmEntities: data.map((farm) => {

            // TODO: remove, they should come from backend
            farm.primary_account_owner_name = 'name';
            farm.primary_account_owner_email = 'email';
            farm.farm_photos = [];
            return MiningFarmEntity.fromJson(farm)
        }),
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

        // TODO: these should have an input?
        miningFarmEntity.leftoverRewardsAddress = 'test';
        miningFarmEntity.maintenanceFeePayoutAddress = 'test';
        miningFarmEntity.rewardsFromPoolAddress = 'test';
        const { data: farm } = await axios.put('/api/v1/farm', MiningFarmEntity.toJson(miningFarmEntity))
        // TODO: remove, they should come from backend
        farm.primary_account_owner_name = 'name';
        farm.primary_account_owner_email = 'email';
        return MiningFarmEntity.fromJson(farm);
    }

    async approveMiningFarm(miningFarmId: string): Promise < void > {
        const { data } = await axios.patch(`/api/v1/farm/${miningFarmId}/status`, { status: MiningFarmStatus.APPROVED });
    }

    async fetchManufacturers(): Promise < ManufacturerEntity[] > {
        const { data } = await axios.get('/api/v1/farm/manufacturers')

        return data.map((manufacturer) => ManufacturerEntity.fromJson(manufacturer))
    }

    async fetchMiners(): Promise < MinerEntity[] > {
        const { data } = await axios.get('/api/v1/farm/miners')

        return data.map((miner) => MinerEntity.fromJson(miner))
    }

    async fetchEnergySources(): Promise < EnergySourceEntity[] > {
        const { data } = await axios.get('/api/v1/farm/energy-sources')

        return data.map((energySource) => EnergySourceEntity.fromJson(energySource))
    }

    async creditManufacturer(manufacturerEntity: ManufacturerEntity): Promise < void > {
        await axios.put('/api/v1/farm/manufacturers', ManufacturerEntity.toJson(manufacturerEntity))
    }

    async creditMiner(minerEntity: MinerEntity): Promise < void > {
        await axios.put('/api/v1/farm/miners', MinerEntity.toJson(minerEntity))
    }

    async creditEnergySource(energySourceEntity: EnergySourceEntity): Promise < void > {
        await axios.put('/api/v1/farm/energy-sources', EnergySourceEntity.toJson(energySourceEntity))
    }

}
