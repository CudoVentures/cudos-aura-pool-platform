import SettingsRepo from '../../presentation/repos/SettingsRepo';
import SettingsEntity from '../../entities/SettingsEntity';
import GeneralApi from '../data-sources/GeneralApi';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';

export default class SettingsApiRepo implements SettingsRepo {

    generalApi: GeneralApi;
    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;

    constructor() {
        this.generalApi = new GeneralApi();
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

    async fetchSettings(): Promise < SettingsEntity > {
        try {
            this.disableActions?.();
            return await this.generalApi.fetchSettings();
        } finally {
            this.enableActions?.();
        }
    }

    async creditSettings(settingsEntity: SettingsEntity): Promise < void > {
        try {
            this.disableActions?.();
            const resultSettingsEntity = await this.generalApi.creditSettings(settingsEntity);
            await runInActionAsync(() => {
                Object.assign(settingsEntity, resultSettingsEntity);
            });
        } finally {
            this.enableActions?.();
        }
    }

}
