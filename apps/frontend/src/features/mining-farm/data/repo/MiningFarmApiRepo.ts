import S from '../../../../core/utilities/Main';
import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../../presentation/repos/MiningFarmRepo';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmApi from '../data-sources/MiningFarmApi';
import JwtDecode from 'jwt-decode'

export default class MiningFarmApiRepo implements MiningFarmRepo {

    miningFarmApi: MiningFarmApi;

    constructor() {
        this.miningFarmApi = new MiningFarmApi();
    }

    async fetchAllMiningFarms(status: MiningFarmStatus = MiningFarmStatus.APPROVED): Promise < MiningFarmEntity[] > {
        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.from = 0;
        miningFarmFilterModel.count = Number.MAX_SAFE_INTEGER;
        miningFarmFilterModel.status = status;

        const { miningFarmEntities, total } = await this.fetchMiningFarmsByFilter(miningFarmFilterModel);
        return miningFarmEntities
    }

    async fetchPopularMiningFarms(status: MiningFarmStatus = MiningFarmStatus.APPROVED): Promise < MiningFarmEntity[] > {
        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.from = 0;
        miningFarmFilterModel.count = Number.MAX_SAFE_INTEGER;
        miningFarmFilterModel.sortKey = MiningFarmFilterModel.SORT_KEY_POPULAR;
        miningFarmFilterModel.status = status;

        const { miningFarmEntities, total } = await this.fetchMiningFarmsByFilter(miningFarmFilterModel);
        return miningFarmEntities;
    }

    async fetchMiningFarmsByIds(miningFarmIds: string[], status: MiningFarmStatus = MiningFarmStatus.APPROVED): Promise < MiningFarmEntity[] > {
        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.from = 0;
        miningFarmFilterModel.count = Number.MAX_SAFE_INTEGER;
        miningFarmFilterModel.miningFarmIds = miningFarmIds;
        miningFarmFilterModel.status = status;

        const { miningFarmEntities, total } = await this.fetchMiningFarmsByFilter(miningFarmFilterModel);
        return miningFarmEntities;
    }

    async fetchMiningFarmById(miningFarmId: string, status: MiningFarmStatus = MiningFarmStatus.APPROVED): Promise < MiningFarmEntity > {
        const miningFarmEntities = await this.fetchMiningFarmsByIds([miningFarmId], status);
        return miningFarmEntities.length === 1 ? miningFarmEntities[0] : null;
    }

    async fetchMiningFarmBySessionAccountId(status: MiningFarmStatus = MiningFarmStatus.APPROVED): Promise < MiningFarmEntity > {
        const user = localStorage.getItem('access_token') && JwtDecode(localStorage.getItem('access_token'))
        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.sessionAccount = user.id;
        miningFarmFilterModel.from = 0;
        miningFarmFilterModel.count = Number.MAX_SAFE_INTEGER;
        miningFarmFilterModel.status = status;

        const { miningFarmEntities, total } = await this.fetchMiningFarmsByFilter(miningFarmFilterModel);
        return miningFarmEntities.length === 1 ? miningFarmEntities[0] : null;
    }

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        return this.miningFarmApi.fetchMiningFarmsByFilter(miningFarmFilterModel);
    }

    async fetchMiningFarmDetailsById(miningFarmId: string): Promise < MiningFarmDetailsEntity > {
        const miningFarmDetailsEntities = await this.fetchMiningFarmsDetailsByIds([miningFarmId]);
        return miningFarmDetailsEntities.length === 1 ? miningFarmDetailsEntities[0] : null;
    }

    async fetchMiningFarmsDetailsByIds(miningFarmIds: string[]): Promise < MiningFarmDetailsEntity[] > {
        return this.miningFarmApi.fetchMiningFarmsDetailsByIds(miningFarmIds);
    }

    async creditMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < void > {
        const resultMiningFarmEntity = await this.miningFarmApi.creditMiningFarm(miningFarmEntity);
        Object.assign(miningFarmEntity, resultMiningFarmEntity);
    }

    async creditMiningFarms(miningFarmEntities: MiningFarmEntity[]): Promise < void > {
        for (let i = miningFarmEntities.length; i-- > 0;) {
            await this.creditMiningFarm(miningFarmEntities[i]);
        }
    }

    async fetchManufacturers(): Promise < ManufacturerEntity[] > {
        return this.miningFarmApi.fetchManufacturers();
    }

    async approveMiningFarms(miningFarmEntities: MiningFarmEntity[]): Promise < void > {
        for (let i = miningFarmEntities.length; i-- > 0;) {
            await this.miningFarmApi.approveMiningFarm(miningFarmEntities[i].id);
        }
    }
    async fetchMiners(): Promise < MinerEntity[] > {
        return this.miningFarmApi.fetchMiners();
    }

    async fetchEnergySources(): Promise < EnergySourceEntity[] > {
        return this.miningFarmApi.fetchEnergySources();
    }

    async creditManufacturer(manufacturerEntity: ManufacturerEntity): Promise < void > {
        const resultEntity = await this.miningFarmApi.creditManufacturer(manufacturerEntity);
        Object.assign(manufacturerEntity, resultEntity);
    }

    async creditMiner(minerEntity: MinerEntity): Promise < void > {
        const resultEntity = await this.miningFarmApi.creditMiner(minerEntity);
        Object.assign(minerEntity, resultEntity);
    }

    async creditEnergySource(energySourceEntity: EnergySourceEntity): Promise < void > {
        const resultEntity = await this.miningFarmApi.creditEnergySource(energySourceEntity);
        Object.assign(energySourceEntity, resultEntity);
    }

}
