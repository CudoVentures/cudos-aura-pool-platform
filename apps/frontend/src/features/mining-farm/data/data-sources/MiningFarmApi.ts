import MiningFarmEntity from '../../entities/MiningFarmEntity';
import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import axios from '../../../../core/utilities/AxiosWrapper';
import { ReqCreditMiningFarm } from '../dto/Requests';
import { ResCreditMiningFarm } from '../dto/Responses';

export default class MiningFarmApi {

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        const { data } = await axios.post('/api/v1/farm', MiningFarmFilterModel.toJson(miningFarmFilterModel));

        return {
            miningFarmEntities: data.miningFarmEntities.map((json) => MiningFarmEntity.fromJson(json)),
            total: data.total,
        }
    }

    async fetchMiningFarmsDetailsByIds(miningFarmIds: string[]): Promise < MiningFarmDetailsEntity[] > {
        const { data } = await axios.get('/api/v1/farm/details', { params: {
            ids: miningFarmIds.join(','),
        } })

        return data.map((farmDetails) => MiningFarmDetailsEntity.fromJson(farmDetails))
    }

    async creditMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < MiningFarmEntity > {
        const { data } = await axios.put('/api/v1/farm', new ReqCreditMiningFarm(miningFarmEntity));
        const res = new ResCreditMiningFarm(data);
        return res.miningFarmEntity;
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

    async creditManufacturer(manufacturerEntity: ManufacturerEntity): Promise < ManufacturerEntity > {
        const { data } = await axios.put('/api/v1/farm/manufacturers', ManufacturerEntity.toJson(manufacturerEntity))
        return ManufacturerEntity.fromJson(data);
    }

    async creditMiner(minerEntity: MinerEntity): Promise < MinerEntity > {
        const { data } = await axios.put('/api/v1/farm/miners', MinerEntity.toJson(minerEntity))
        return MinerEntity.fromJson(data);
    }

    async creditEnergySource(energySourceEntity: EnergySourceEntity): Promise < EnergySourceEntity > {
        const { data } = await axios.put('/api/v1/farm/energy-sources', EnergySourceEntity.toJson(energySourceEntity))
        return EnergySourceEntity.fromJson(data);
    }

}
