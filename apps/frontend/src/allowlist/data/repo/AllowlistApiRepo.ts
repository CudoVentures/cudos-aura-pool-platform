import AllowlistUserEntity from '../../entities/AllowlistUserEntity';
import AllowlistRepo from '../../presentation/repos/AllowlistRepo';
import AllowlistApi from '../data-sources/AllowlistApi';

export default class AllowlistApiRepo implements AllowlistRepo {
    allowlistApi: AllowlistApi;

    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;

    constructor() {
        this.allowlistApi = new AllowlistApi();

        this.enableActions = null;
        this.disableActions = null;
        this.showAlert = null;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener: null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void) {
        this.showAlert = showAlert;
    }

    async fetchTotalListedUsers(): Promise < number > {
        try {
            this.disableActions?.();

            return await this.allowlistApi.fetchTotalListedUsers();
        } catch (e) {
            console.log(e);
            return 0;
        } finally {
            this.enableActions?.();
        }
    }

    async fetchAllowlistUserBySessionAccount(): Promise < AllowlistUserEntity > {
        try {
            this.disableActions?.();

            return await this.allowlistApi.fetchAllowlistUserBySessionAccount();
        } catch (e) {
            console.log(e);
            return null;
        } finally {
            this.enableActions?.();
        }
    }

}
