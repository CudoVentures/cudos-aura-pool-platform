import CudosDataEntity from '../../entities/CudosDataEntity';

export class ResFetchCudosData {

    cudosDataEntity: CudosDataEntity;

    constructor(data) {
        this.cudosDataEntity = CudosDataEntity.fromJson(data.cudosDataEntity);
    }
}
