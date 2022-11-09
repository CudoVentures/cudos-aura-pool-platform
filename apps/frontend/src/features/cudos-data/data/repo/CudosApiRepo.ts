import CudosDataEntity from '../../entities/CudosDataEntity';
import CudosRepo from '../../presentation/repos/CudosRepo';
import CudosApi from '../data-sources/CudosApi';

const LOCAL_STORAGE_KEY = 'cudos_aura_service_storage_cudos';

export default class CudosApiRepo implements CudosRepo {

    cudosApi: CudosApi;
    enableActions: () => void;
    disableActions: () => void;

    constructor() {
        this.cudosApi = new CudosApi();
        this.enableActions = null;
        this.disableActions = null;
    }

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    async fetchCudosData(): Promise < CudosDataEntity > {
        let cudosDataEntity = new CudosDataEntity();
        const cudosDataEntityJsonString = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cudosDataEntityJsonString !== null) {
            const cudosDataEntityJson = JSON.parse(cudosDataEntityJsonString);
            if (cudosDataEntity.modelVersion === CudosDataEntity.MODEL_VERSION) {
                cudosDataEntity = CudosDataEntity.fromJson(cudosDataEntityJson);
            }
        }

        if (cudosDataEntity.shouldUpdate() === false) {
            return cudosDataEntity;
        }

        try {
            this.disableActions?.();
            cudosDataEntity = await this.cudosApi.fetchCudosData();
            cudosDataEntity.timestampLastUpdate = Date.now();

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(CudosDataEntity.toJson(cudosDataEntity)));
        } finally {
            this.enableActions?.();
        }

        return cudosDataEntity;
    }

}
