import S from '../../../../core/utilities/Main';
import StorageHelper from '../../../../core/helpers/StorageHelper';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../../presentation/repos/MiningFarmRepo';
import MiningFarmFilterModel, { MiningFarmOrderBy } from '../../utilities/MiningFarmFilterModel';
import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';

export default class MiningFarmStorageRepo implements MiningFarmRepo {

    storageHelper: StorageHelper;

    constructor(storageHelper: StorageHelper) {
        this.storageHelper = storageHelper;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {}
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void) {}

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
        miningFarmFilterModel.orderBy = MiningFarmOrderBy.POPULAR_DESC;
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

        if (miningFarmFilterModel.status !== null) {
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

    async fetchMiningFarmDetailsById(miningFarmId: string): Promise < MiningFarmDetailsEntity > {
        const miningFarmDetailsEntities = await this.fetchMiningFarmsDetailsByIds([miningFarmId]);
        return miningFarmDetailsEntities.length === 1 ? miningFarmDetailsEntities[0] : null;
    }

    async fetchMiningFarmsDetailsByIds(miningFarmIds: string[]): Promise < MiningFarmDetailsEntity[] > {
        return miningFarmIds.map((miningFarmId) => {
            const miningFarmEntity = this.storageHelper.miningFarmsJson.find((miningFarmJson) => {
                return miningFarmJson.id === miningFarmId;
            });
            const remainingHashPowerInTh = this.storageHelper.collectionsJson.reduce((accu, collectionJson) => {
                return accu - (collectionJson.farmId === miningFarmId ? collectionJson.hashPowerInTh : 0);
            }, miningFarmEntity.hashPowerInTh);

            const miningFarmDetailsEntity = new MiningFarmDetailsEntity();

            miningFarmDetailsEntity.miningFarmId = miningFarmId;
            miningFarmDetailsEntity.averageHashPowerInTh = Math.round(Math.random() * 200);
            miningFarmDetailsEntity.activeWorkers = Math.round(Math.random() * 15);
            miningFarmDetailsEntity.nftsOwned = Math.round(Math.random() * 2000);
            miningFarmDetailsEntity.totalNftsSold = Math.round(Math.random() * 20000);
            miningFarmDetailsEntity.remainingHashPowerInTH = remainingHashPowerInTh;

            return miningFarmDetailsEntity;
        });
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

        Object.assign(miningFarmEntity, MiningFarmEntity.fromJson(miningFarmJson));

        this.storageHelper.save();
    }

    async creditMiningFarms(miningFarmEntities: MiningFarmEntity[]): Promise < void > {
        for (let i = miningFarmEntities.length; i-- > 0;) {
            await this.creditMiningFarm(miningFarmEntities[i]);
        }
    }

    async fetchManufacturers(): Promise < ManufacturerEntity[] > {
        return this.storageHelper.manufacturersJson.map((m) => {
            return ManufacturerEntity.fromJson(m);
        });
    }

    async fetchMiners(): Promise < MinerEntity[] > {
        return this.storageHelper.minersJson.map((m) => {
            return MinerEntity.fromJson(m);
        })
    }

    async fetchEnergySources(): Promise < EnergySourceEntity[] > {
        return this.storageHelper.energySourcesJson.map((m) => {
            return EnergySourceEntity.fromJson(m);
        });
    }

    async creditManufacturer(manufacturerEntity: ManufacturerEntity): Promise < void > {
        let manufacturerJson = this.storageHelper.manufacturersJson.find((json) => {
            return json.manufacturerId === manufacturerEntity.manufacturerId;
        });

        if (manufacturerJson !== undefined) {
            Object.assign(manufacturerJson, ManufacturerEntity.toJson(manufacturerEntity));
        } else {
            const lastManufacturerEntity = this.storageHelper.manufacturersJson.last();
            const nextManufacturerId = 1 + (lastManufacturerEntity !== null ? parseInt(lastManufacturerEntity.manufacturerId) : 0);

            manufacturerJson = ManufacturerEntity.toJson(manufacturerEntity);
            manufacturerJson.manufacturerId = nextManufacturerId.toString();

            this.storageHelper.manufacturersJson.push(manufacturerJson);
        }

        Object.assign(manufacturerEntity, ManufacturerEntity.fromJson(manufacturerJson));

        this.storageHelper.save();
    }

    async creditMiner(minerEntity: MinerEntity): Promise < void > {
        let minerJson = this.storageHelper.minersJson.find((json) => {
            return json.minerId === minerEntity.minerId;
        })

        if (minerJson !== undefined) {
            Object.assign(minerJson, MinerEntity.toJson(minerEntity));
        } else {
            const lastMinerEntity = this.storageHelper.minersJson.last();
            const nextMinerId = 1 + (lastMinerEntity !== null ? parseInt(lastMinerEntity.minerId) : 0);

            minerJson = MinerEntity.fromJson(minerEntity);
            minerJson.minerId = nextMinerId.toString();

            this.storageHelper.minersJson.push(minerJson);
        }

        Object.assign(minerEntity, MinerEntity.fromJson(minerJson));

        this.storageHelper.save();
    }

    async creditEnergySource(energySourceEntity: EnergySourceEntity): Promise < void > {
        let energySourceJson = this.storageHelper.energySourcesJson.find((json) => {
            return json.energySourceId === energySourceEntity.energySourceId;
        })

        if (energySourceJson !== undefined) {
            Object.assign(energySourceJson, EnergySourceEntity.toJson(energySourceEntity));
        } else {
            const lastEnergySourceEntity = this.storageHelper.energySourcesJson.last();
            const nextEnergySourceId = 1 + (lastEnergySourceEntity !== null ? parseInt(lastEnergySourceEntity.energySourceId) : 0);

            energySourceJson = EnergySourceEntity.fromJson(energySourceEntity);
            energySourceJson.energySourceId = nextEnergySourceId.toString();

            this.storageHelper.energySourcesJson.push(energySourceJson);
        }

        Object.assign(energySourceEntity, EnergySourceEntity.fromJson(energySourceJson));

        this.storageHelper.save();
    }

}
