import CudosDataEntity from '../../entities/CudosDataEntity';
import CudosRepo from '../../presentation/repos/CudosRepo';
import CudosApi from '../data-sources/CudosApi';

const LOCAL_STORAGE_KEY = 'cudos_aura_service_storage_cudos';

export default class CudosApiRepo implements CudosRepo {

    cudosApi: CudosApi;

    constructor() {
        this.cudosApi = new CudosApi();
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

        cudosDataEntity = await this.cudosApi.fetchCudosData();
        cudosDataEntity.timestampLastUpdate = Date.now();

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(CudosDataEntity.toJson(cudosDataEntity)));
        return cudosDataEntity;
    }

}
