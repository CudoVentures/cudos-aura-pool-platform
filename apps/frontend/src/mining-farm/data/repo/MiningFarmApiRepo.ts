import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../../presentation/repos/MiningFarmRepo';
import MiningFarmFilterModel, { MiningFarmOrderBy } from '../../utilities/MiningFarmFilterModel';
import MiningFarmApi from '../data-sources/MiningFarmApi';
import S from '../../../core/utilities/Main';
import { BackendErrorType, parseBackendErrorType } from '../../../core/utilities/AxiosWrapper';
import MiningFarmPerformanceEntity from '../../entities/MiningFarmPerformanceEntity';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import DefaultProgressHandler from '../../../core/utilities/DefaultProgressHandler';

export default class MiningFarmApiRepo implements MiningFarmRepo {

    miningFarmApi: MiningFarmApi;
    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;
    onProgress: (title: string, progress: number) => void;

    constructor() {
        this.miningFarmApi = new MiningFarmApi();
        this.enableActions = null;
        this.disableActions = null;
        this.showAlert = null;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void) {
        this.showAlert = showAlert;
    }

    setProgressCallbacks(onProgress: (title: string, progress: number) => void) {
        this.onProgress = onProgress;
    }

    async fetchAllMiningFarms(status: MiningFarmStatus = MiningFarmStatus.APPROVED): Promise < MiningFarmEntity[] > {
        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.from = 0;
        miningFarmFilterModel.count = Number.MAX_SAFE_INTEGER;
        miningFarmFilterModel.status = [status];

        const { miningFarmEntities, total } = await this.fetchMiningFarmsByFilter(miningFarmFilterModel);
        return miningFarmEntities
    }

    async fetchPopularMiningFarms(status: MiningFarmStatus = MiningFarmStatus.APPROVED): Promise < MiningFarmEntity[] > {
        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.from = 0;
        miningFarmFilterModel.count = 10;
        miningFarmFilterModel.orderBy = MiningFarmOrderBy.POPULAR_DESC;
        if (status) {
            miningFarmFilterModel.status = [status];
        }
        const { miningFarmEntities, total } = await this.fetchMiningFarmsByFilter(miningFarmFilterModel);
        return miningFarmEntities;
    }

    async fetchBestPerformingMiningFarm(timestampFrom: number, timestampTo: number): Promise < { miningFarmEntities: MiningFarmEntity[], miningFarmPerformanceEntities: MiningFarmPerformanceEntity[] } > {
        try {
            this.disableActions?.();
            return await this.miningFarmApi.fetchBestPerformingMiningFarm(timestampFrom, timestampTo);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchMiningFarmsByIds(miningFarmIds: string[], status: MiningFarmStatus): Promise < MiningFarmEntity[] > {
        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.from = 0;
        miningFarmFilterModel.count = Number.MAX_SAFE_INTEGER;
        miningFarmFilterModel.miningFarmIds = miningFarmIds;
        if (status) {
            miningFarmFilterModel.status = [status];
        }
        const { miningFarmEntities, total } = await this.fetchMiningFarmsByFilter(miningFarmFilterModel);
        return miningFarmEntities;
    }

    async fetchMiningFarmById(miningFarmId: string, status: MiningFarmStatus): Promise < MiningFarmEntity > {
        const miningFarmEntities = await this.fetchMiningFarmsByIds([miningFarmId], status);
        return miningFarmEntities.length === 1 ? miningFarmEntities[0] : null;
    }

    async fetchMiningFarmBySessionAccountId(status: MiningFarmStatus): Promise < MiningFarmEntity > {
        const miningFarmFilterModel = new MiningFarmFilterModel();
        miningFarmFilterModel.sessionAccount = S.INT_TRUE;
        miningFarmFilterModel.from = 0;
        miningFarmFilterModel.count = Number.MAX_SAFE_INTEGER;
        if (status) {
            miningFarmFilterModel.status = [status];
        }
        const { miningFarmEntities, total } = await this.fetchMiningFarmsByFilter(miningFarmFilterModel);
        return miningFarmEntities.length === 1 ? miningFarmEntities[0] : null;
    }

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        try {
            this.disableActions?.();
            let fetchMiningFarmsResult = await this.miningFarmApi.fetchMiningFarmsByFilter(miningFarmFilterModel);
            if (fetchMiningFarmsResult.miningFarmEntities.length === 0 && fetchMiningFarmsResult.total !== 0) {
                if (miningFarmFilterModel.goToLastPossbilePage(fetchMiningFarmsResult.total) === true) {
                    fetchMiningFarmsResult = await this.miningFarmApi.fetchMiningFarmsByFilter(miningFarmFilterModel);
                }
            }

            return fetchMiningFarmsResult
        } finally {
            this.enableActions?.();
        }
    }

    async fetchMiningFarmDetailsById(miningFarmId: string, includesExternalDetails: number = S.INT_FALSE): Promise < MiningFarmDetailsEntity > {
        const miningFarmDetailsEntities = await this.fetchMiningFarmsDetailsByIds([miningFarmId], includesExternalDetails);
        return miningFarmDetailsEntities.length === 1 ? miningFarmDetailsEntities[0] : null;
    }

    async fetchMiningFarmsDetailsByIds(miningFarmIds: string[], includesExternalDetails: number = S.INT_FALSE): Promise < MiningFarmDetailsEntity[] > {
        try {
            this.disableActions?.();
            return await this.miningFarmApi.fetchMiningFarmsDetailsByIds(miningFarmIds, includesExternalDetails);
        } finally {
            this.enableActions?.();
        }
    }

    async creditMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < void > {
        const progressHandler = new DefaultProgressHandler('Uploading farm...', 'Processing farm...', this.onProgress);
        try {
            this.disableActions?.();

            const resultMiningFarmEntity = await this.miningFarmApi.creditMiningFarm(miningFarmEntity, progressHandler.onProgress);

            await runInActionAsync(() => {
                Object.assign(miningFarmEntity, resultMiningFarmEntity);
            })
        } catch (e) {
            const error = parseBackendErrorType(e);
            switch (error) {
                case BackendErrorType.NOT_FOUND:
                    this.showAlert?.('Farm not found.');
                    throw Error(error);
                case BackendErrorType.FARM_CREATION_ERROR:
                    this.showAlert?.('There was an error in farm creation. Please try again later.');
                    throw Error(error);
                default:
                    throw Error(error);
            }
        } finally {
            this.enableActions?.();
            progressHandler.finish();
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
