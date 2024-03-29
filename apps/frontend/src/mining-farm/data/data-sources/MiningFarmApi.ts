import MiningFarmEntity from '../../entities/MiningFarmEntity';
import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import axios from '../../../core/utilities/AxiosWrapper';
import { ReqCreditEnergySource, ReqCreditManufacturer, ReqCreditMiner, ReqCreditMiningFarm, ReqFetchBestPerformingMiningFarms, ReqFetchMiningFarmDetails } from '../dto/Requests';
import { ResCreditEnergySource, ResCreditManufacturer, ResCreditMiner, ResCreditMiningFarm, ResFetchBestPerformingMiningFarms, ResFetchEnergySources, ResFetchManufacturers, ResFetchMiners, ResFetchMiningFarmDetails } from '../dto/Responses';
import MiningFarmPerformanceEntity from '../../entities/MiningFarmPerformanceEntity';
import { AxiosProgressEvent } from 'axios';

export default class MiningFarmApi {

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        const { data } = await axios.post('/api/v1/farm', MiningFarmFilterModel.toJson(miningFarmFilterModel));

        return {
            miningFarmEntities: data.miningFarmEntities.map((json) => MiningFarmEntity.fromJson(json)),
            total: data.total,
        }
    }

    async fetchBestPerformingMiningFarm(timestampFrom: number, timestampTo: number): Promise < { miningFarmEntities: MiningFarmEntity[], miningFarmPerformanceEntities: MiningFarmPerformanceEntity[] } > {
        const { data } = await axios.post('/api/v1/farm/fetchBestPerformingMiningFarm', new ReqFetchBestPerformingMiningFarms(timestampFrom, timestampTo));
        const res = new ResFetchBestPerformingMiningFarms(data);
        return {
            miningFarmEntities: res.miningFarmEntities,
            miningFarmPerformanceEntities: res.miningFarmPerformanceEntities,
        };
    }

    async fetchMiningFarmsDetailsByIds(miningFarmIds: string[], includesExternalDetails: number): Promise < MiningFarmDetailsEntity[] > {
        const { data } = await axios.post('/api/v1/farm/fetchMiningFarmsDetailsByIds', new ReqFetchMiningFarmDetails(miningFarmIds, includesExternalDetails));
        const res = new ResFetchMiningFarmDetails(data);
        return res.miningFarmDetailsEntities;
    }

    async creditMiningFarm(miningFarmEntity: MiningFarmEntity, onUploadProgress: (progressEvent: AxiosProgressEvent) => void = null): Promise < MiningFarmEntity > {
        const { data } = await axios.put('/api/v1/farm', new ReqCreditMiningFarm(miningFarmEntity), {
            onUploadProgress,
        });
        const res = new ResCreditMiningFarm(data);
        return res.miningFarmEntity;
    }

    async fetchManufacturers(): Promise < ManufacturerEntity[] > {
        const { data } = await axios.get('/api/v1/farm/manufacturers')
        const res = new ResFetchManufacturers(data);
        return res.manufacturerEntities;
    }

    async fetchMiners(): Promise < MinerEntity[] > {
        const { data } = await axios.get('/api/v1/farm/miners')
        const res = new ResFetchMiners(data);
        return res.minerEntities;
    }

    async fetchEnergySources(): Promise < EnergySourceEntity[] > {
        const { data } = await axios.get('/api/v1/farm/energy-sources');
        const res = new ResFetchEnergySources(data);
        return res.energySourceEntities;
    }

    async creditManufacturer(manufacturerEntity: ManufacturerEntity): Promise < ManufacturerEntity > {
        const { data } = await axios.put('/api/v1/farm/manufacturers', new ReqCreditManufacturer(manufacturerEntity));
        const res = new ResCreditManufacturer(data);
        return res.manufacturerEntity;
    }

    async creditMiner(minerEntity: MinerEntity): Promise < MinerEntity > {
        const { data } = await axios.put('/api/v1/farm/miners', new ReqCreditMiner(minerEntity));
        const res = new ResCreditMiner(data);
        return res.minerEntity;
    }

    async creditEnergySource(energySourceEntity: EnergySourceEntity): Promise < EnergySourceEntity > {
        const { data } = await axios.put('/api/v1/farm/energy-sources', new ReqCreditEnergySource(energySourceEntity));
        const res = new ResCreditEnergySource(data);
        return res.energySourceEntity;
    }

}
