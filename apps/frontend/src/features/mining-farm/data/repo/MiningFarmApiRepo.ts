import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../../presentation/repos/MiningFarmRepo';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmApi from '../data-sources/MiningFarmApi';
import JwtDecode from 'jwt-decode'
import { decodeStorageToken } from '../../../../core/utilities/AxiosWrapper';

export default class MiningFarmApiRepo implements MiningFarmRepo {

    miningFarmApi: MiningFarmApi;
    enableActions: () => void;
    disableActions: () => void;

    constructor() {
        this.miningFarmApi = new MiningFarmApi();
        this.enableActions = null;
        this.disableActions = null;
    }

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
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

    async fetchMiningFarmBySessionAccountId(status: MiningFarmStatus): Promise < MiningFarmEntity > {
        const user = decodeStorageToken();

        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.sessionAccount = user.id;
        miningFarmFilterModel.from = 0;
        miningFarmFilterModel.count = Number.MAX_SAFE_INTEGER;
        miningFarmFilterModel.status = status

        const { miningFarmEntities, total } = await this.fetchMiningFarmsByFilter(miningFarmFilterModel);
        return miningFarmEntities.length === 1 ? miningFarmEntities[0] : null;
    }

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        try {
            this.disableActions?.();
            return await this.miningFarmApi.fetchMiningFarmsByFilter(miningFarmFilterModel);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchMiningFarmDetailsById(miningFarmId: string): Promise < MiningFarmDetailsEntity > {
        const miningFarmDetailsEntities = await this.fetchMiningFarmsDetailsByIds([miningFarmId]);
        return miningFarmDetailsEntities.length === 1 ? miningFarmDetailsEntities[0] : null;
    }

    async fetchMiningFarmsDetailsByIds(miningFarmIds: string[]): Promise < MiningFarmDetailsEntity[] > {
        try {
            this.disableActions?.();
            return await this.miningFarmApi.fetchMiningFarmsDetailsByIds(miningFarmIds);
        } finally {
            this.enableActions?.();
        }
    }

    async creditMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < void > {
        try {
            this.disableActions?.();
            const resultMiningFarmEntity = await this.miningFarmApi.creditMiningFarm(miningFarmEntity);
            Object.assign(miningFarmEntity, resultMiningFarmEntity);
        } finally {
            this.enableActions?.();
        }
    }

    async creditMiningFarms(miningFarmEntities: MiningFarmEntity[]): Promise < void > {
        for (let i = miningFarmEntities.length; i-- > 0;) {
            await this.creditMiningFarm(miningFarmEntities[i]);
        }
    }

    async approveMiningFarms(miningFarmEntities: MiningFarmEntity[]): Promise < void > {
        for (let i = miningFarmEntities.length; i-- > 0;) {
            await this.miningFarmApi.approveMiningFarm(miningFarmEntities[i].id);
        }
    }

    async fetchManufacturers(): Promise < ManufacturerEntity[] > {
        try {
            this.disableActions?.();
            return await this.miningFarmApi.fetchManufacturers();
        } finally {
            this.enableActions?.();
        }
    }

    async fetchMiners(): Promise < MinerEntity[] > {
        try {
            this.disableActions?.();
            return await this.miningFarmApi.fetchMiners();
        } finally {
            this.enableActions?.();
        }
    }

    async fetchEnergySources(): Promise < EnergySourceEntity[] > {
        try {
            this.disableActions?.();
            return await this.miningFarmApi.fetchEnergySources();
        } finally {
            this.enableActions?.();
        }
    }

    async creditManufacturer(manufacturerEntity: ManufacturerEntity): Promise < void > {
        try {
            this.disableActions?.();
            const resultEntity = await this.miningFarmApi.creditManufacturer(manufacturerEntity);
            Object.assign(manufacturerEntity, resultEntity);
        } finally {
            this.enableActions?.();
        }
    }

    async creditMiner(minerEntity: MinerEntity): Promise < void > {
        try {
            this.disableActions?.();
            const resultEntity = await this.miningFarmApi.creditMiner(minerEntity);
            Object.assign(minerEntity, resultEntity);
        } finally {
            this.enableActions?.();
        }
    }

    async creditEnergySource(energySourceEntity: EnergySourceEntity): Promise < void > {
        try {
            this.disableActions?.();
            const resultEntity = await this.miningFarmApi.creditEnergySource(energySourceEntity);
            Object.assign(energySourceEntity, resultEntity);
        } finally {
            this.enableActions?.();
        }
    }

}
