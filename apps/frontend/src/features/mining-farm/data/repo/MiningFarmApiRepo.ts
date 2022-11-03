import S from '../../../../core/utilities/Main';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../../presentation/repos/MiningFarmRepo';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmApi from '../data-sources/MiningFarmApi';

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
        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.sessionAccount = S.INT_TRUE;
        miningFarmFilterModel.from = 0;
        miningFarmFilterModel.count = Number.MAX_SAFE_INTEGER;
        miningFarmFilterModel.status = status;

        const { miningFarmEntities, total } = await this.fetchMiningFarmsByFilter(miningFarmFilterModel);
        return miningFarmEntities.length === 1 ? miningFarmEntities[0] : null;
    }

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        return this.miningFarmApi.fetchMiningFarmsByFilter(miningFarmFilterModel);
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

    async fetchMiningFarmSalesStatistics(miningFarmId: string, timestamp: number): Promise < number[] > {
        return this.miningFarmApi.fetchMiningFarmSalesStatistics(miningFarmId, timestamp);
    }

    async approveMiningFarms(miningFarmEntities: MiningFarmEntity[]): Promise < void > {
        for (let i = miningFarmEntities.length; i-- > 0;) {
            await this.miningFarmApi.approveMiningFarm(miningFarmEntities[i].id);
        }
    }
}
