import S from '../../../../core/utilities/Main';
import StorageHelper from '../../../../core/helpers/StorageHelper';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../../presentation/repos/MiningFarmRepo';
import MiningFarmFilterModel, { MiningFarmHashPowerFilter } from '../../utilities/MiningFarmFilterModel';

export default class MiningFarmStorageRepo implements MiningFarmRepo {

    storageHelper: StorageHelper;

    constructor(storageHelper: StorageHelper) {
        this.storageHelper = storageHelper;
    }

    async fetchAllMiningFarms(): Promise < MiningFarmEntity[] > {
        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.from = 0;
        miningFarmFilterModel.count = Number.MAX_SAFE_INTEGER;

        const { miningFarmEntities, total } = await this.fetchMiningFarmsByFilter(miningFarmFilterModel);
        return miningFarmEntities
    }

    async fetchPopularMiningFarms(): Promise < MiningFarmEntity[] > {
        return this.storageHelper.miningFarmsJson.slice(0, 3).map((json: any) => MiningFarmEntity.fromJson(json));
    }

    async fetchMiningFarmsByIds(miningFarmIds: string[]): Promise < MiningFarmEntity[] > {
        const farmsJson = this.storageHelper.miningFarmsJson.filter((json: any) => miningFarmIds.includes(json.id));
        return farmsJson.map((farmJson) => MiningFarmEntity.fromJson(farmJson));
    }

    async fetchMiningFarmById(miningFarmId: string): Promise < MiningFarmEntity > {
        const miningFarmEntities = await this.fetchMiningFarmsByIds([miningFarmId]);
        return miningFarmEntities.length === 1 ? miningFarmEntities[0] : null;
    }

    async fetchMiningFarmBySessionAccountId(): Promise < MiningFarmEntity > {
        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.sessionAccount = S.INT_TRUE;

        const { miningFarmEntities, total } = await this.fetchMiningFarmsByFilter(miningFarmFilterModel);
        return miningFarmEntities.length === 1 ? miningFarmEntities[0] : null;
    }

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        let miningFarmsSlice = this.storageHelper.miningFarmsJson.map((json) => MiningFarmEntity.fromJson(json));

        if (miningFarmFilterModel.searchString !== '') {
            miningFarmsSlice = miningFarmsSlice.filter((json) => {
                return json.name.toLowerCase().indexOf(miningFarmFilterModel.searchString) !== -1;
            });
        }

        if (miningFarmFilterModel.hashPowerFilter !== MiningFarmHashPowerFilter.NONE) {
            let hashPowerLimit = S.NOT_EXISTS;
            switch (miningFarmFilterModel.hashPowerFilter) {
                case MiningFarmHashPowerFilter.BELOW_1000_EH:
                    hashPowerLimit = 1000;
                    break;
                case MiningFarmHashPowerFilter.BELOW_2000_EH:
                    hashPowerLimit = 2000;
                    break;
                case MiningFarmHashPowerFilter.ABOVE_2000_EH:
                default:
                    hashPowerLimit = Number.MAX_SAFE_INTEGER;
                    break;

            }

            miningFarmsSlice = miningFarmsSlice.filter((json) => {
                return json.hashRateTh <= hashPowerLimit;
            });
        }

        miningFarmsSlice = miningFarmsSlice.filter((json) => {
            return json.status === miningFarmFilterModel.status || miningFarmFilterModel.status === MiningFarmStatus.ANY;
        });

        if (miningFarmFilterModel.sessionAccount === S.INT_TRUE) {
            miningFarmsSlice = miningFarmsSlice.filter((json) => {
                return (json.accountId === this.storageHelper.sessionAccount?.accountId) || false
            });
        }

        miningFarmsSlice.sort((a: MiningFarmEntity, b: MiningFarmEntity) => {
            switch (miningFarmFilterModel.sortKey) {
                case MiningFarmFilterModel.SORT_KEY_POPULAR:
                    // TODO: what does popular farm mean, how to compare?
                    return a.name.localeCompare(b.name)
                case MiningFarmFilterModel.SORT_KEY_NAME:
                default:
                    return a.name.localeCompare(b.name)
            }
        });

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

    async fetchMiningFarmSalesStatistics(miningFarmId: string): Promise < number[] > {
        return [100, 232, 24, 51, 46, 43, 234, 534, 34, 56, 34, 53, 235, 532, 2, 353, 323, 100, 232, 24, 51, 46, 43, 234, 534, 34, 56, 34, 53, 235, 532, 2, 353, 323];
    }
}
