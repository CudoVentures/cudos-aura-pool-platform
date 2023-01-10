import SettingsEntity from '../../entities/SettingsEntity';

export default interface SettingsRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    fetchSettings(): Promise < SettingsEntity >;
    creditSettings(settingsEntity: SettingsEntity): Promise < void >;

}
