import S from '../../../../core/utilities/Main';
import StorageHelper from '../../../../core/helpers/StorageHelper';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../../presentation/repos/MiningFarmRepo';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';

export default class MiningFarmStorageRepo implements MiningFarmRepo {

    storageHelper: StorageHelper;

    constructor(storageHelper: StorageHelper) {
        this.storageHelper = storageHelper;
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
        let miningFarmsSlice = this.storageHelper.miningFarmsJson.map((json) => MiningFarmEntity.fromJson(json));

        if (miningFarmFilterModel.miningFarmIds !== null) {
            const set = new Set(miningFarmFilterModel.miningFarmIds);
            miningFarmsSlice = miningFarmsSlice.filter((json) => {
                return set.has(json.id);
            });
        }

        if (miningFarmFilterModel.status !== MiningFarmStatus.ANY) {
            miningFarmsSlice = miningFarmsSlice.filter((json) => {
                return json.status === miningFarmFilterModel.status;
            });
        }

        if (miningFarmFilterModel.searchString !== '') {
            miningFarmsSlice = miningFarmsSlice.filter((json) => {
                return json.name.toLowerCase().indexOf(miningFarmFilterModel.searchString) !== -1;
            });
        }

        if (miningFarmFilterModel.sessionAccount === S.INT_TRUE) {
            miningFarmsSlice = miningFarmsSlice.filter((json) => {
                return (json.accountId === this.storageHelper.sessionAccount?.accountId) || false
            });
        }

        return {
            miningFarmEntities: miningFarmsSlice.slice(miningFarmFilterModel.from, miningFarmFilterModel.from + miningFarmFilterModel.count),
            total: miningFarmsSlice.length,
        }
    }

    async creditMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < void > {
        let miningFarmJson = this.storageHelper.miningFarmsJson.find((json) => {
            return json.id === miningFarmEntity.id;
        });

        if (miningFarmJson !== undefined) {
            Object.assign(miningFarmJson, MiningFarmEntity.toJson(miningFarmEntity));
        } else {
            const lastMiningFarmEntity = this.storageHelper.miningFarmsJson.last();
            const nextMiningFarmId = 1 + (lastMiningFarmEntity !== null ? parseInt(lastMiningFarmEntity.id) : 0);

            miningFarmJson = MiningFarmEntity.toJson(miningFarmEntity);
            miningFarmJson.id = nextMiningFarmId.toString();
            miningFarmJson.accountId = this.storageHelper.sessionAccount.accountId;

            this.storageHelper.miningFarmsJson.push(miningFarmJson);
        }

        Object.assign(miningFarmEntity, MiningFarmEntity.fromJson(miningFarmEntity));

        this.storageHelper.save();
    }

    async creditMiningFarms(miningFarmEntities: MiningFarmEntity[]): Promise < void > {
        for (let i = miningFarmEntities.length; i-- > 0;) {
            await this.creditMiningFarm(miningFarmEntities[i]);
        }
    }

    async fetchMiningFarmSalesStatistics(miningFarmId: string, timestamp: number): Promise < number[] > {
        return [100, 232, 24, 51, 46, 43, 234, 534, 34, 56, 34, 53, 235, 532, 2, 353, 323, 100, 232, 24, 51, 46, 43, 234, 534, 34, 56, 34, 53, 235, 532, 2, 353, 323];
    }
}
