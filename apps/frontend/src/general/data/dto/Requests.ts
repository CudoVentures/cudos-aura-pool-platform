import SettingsEntity from '../../entities/SettingsEntity';

export class ReqCreditSettings {

    settingsEntity: SettingsEntity;

    constructor(settingsEntity: SettingsEntity) {
        this.settingsEntity = SettingsEntity.toJson(settingsEntity);
    }

}
