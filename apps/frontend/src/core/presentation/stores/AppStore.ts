import { action, makeAutoObservable } from 'mobx';
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

    @action
    incrementLoading() {
        ++this.loadingPage;
    }

    @action
    decrementLoading() {
        --this.loadingPage;
    }

    hasLoading() {
        return this.loadingPage !== 0;
    }

    disableActions = action(() => {
        ++this.disabledActionsCounter;
    })

    enableActions = action(() => {
        --this.disabledActionsCounter;
    })

    hasDisabledActions() {
        return this.disabledActionsCounter !== 0;
    }

    @action
    incremenetDimmer() {
        ++this.dimmer;
    }

    @action
    decrementDimmer() {
        --this.dimmer;
    }

    hasDimmer() {
        return this.dimmer !== 0;
    }

}
