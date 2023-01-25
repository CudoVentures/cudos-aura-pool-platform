import { makeAutoObservable } from 'mobx';
import WorkerQueueHelper from '../../helpers/WorkerQueueHelper';

export default class AppStore {

    loadingPage = 0;
    disabledActionsCounter = 0;
    dimmer = 0;

    workerQueueHelper: WorkerQueueHelper;

    constructor() {
        this.workerQueueHelper = new WorkerQueueHelper();
        makeAutoObservable(this);
    }

    incrementLoading() {
        ++this.loadingPage;
    }

    decrementLoading() {
        --this.loadingPage;
    }

    hasLoading() {
        return this.loadingPage !== 0;
    }

    disableActions = () => {
        ++this.disabledActionsCounter;
    }

    enableActions = () => {
        --this.disabledActionsCounter;
    }

    hasDisabledActions() {
        return this.disabledActionsCounter !== 0;
    }

    incremenetDimmer() {
        ++this.dimmer;
    }

    decrementDimmer() {
        --this.dimmer;
    }

    hasDimmer() {
        return this.dimmer !== 0;
    }

}
