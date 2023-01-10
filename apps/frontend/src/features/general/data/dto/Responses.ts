import SettingsEntity from '../../entities/SettingsEntity';

export class ResFetchSettings {

    settingsEntity: SettingsEntity;

    constructor(axiosData: any) {
        this.settingsEntity = SettingsEntity.fromJson(axiosData.settingsEntity);
    }

}

export class ResCreditSettings {

    settingsEntity: SettingsEntity;

    constructor(axiosData: any) {
        this.settingsEntity = SettingsEntity.fromJson(axiosData.settingsEntity);
    }

}
