import StorageHelper from '../../../core/helpers/StorageHelper';
import CudosDataEntity from '../../entities/CudosDataEntity';
import CudosRepo from '../../presentation/repos/CudosRepo';

export default class CudosStorageRepo implements CudosRepo {

    storageHelper: StorageHelper;

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {}
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void) {}

    constructor(storageHelper: StorageHelper) {
        this.storageHelper = storageHelper;
    }

    async fetchCudosData(): Promise < CudosDataEntity > {
        return CudosDataEntity.fromJson(this.storageHelper.cudosDataJson);
    }

}
