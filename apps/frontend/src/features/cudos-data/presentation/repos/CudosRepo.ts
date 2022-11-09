import CudosDataEntity from '../../entities/CudosDataEntity';

export default interface CudosRepo {

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void);

    fetchCudosData(): Promise < CudosDataEntity >;

}
