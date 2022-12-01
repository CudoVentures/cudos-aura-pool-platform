import CudosDataEntity from '../../entities/CudosDataEntity';

export default interface CudosRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    fetchCudosData(): Promise < CudosDataEntity >;

}
