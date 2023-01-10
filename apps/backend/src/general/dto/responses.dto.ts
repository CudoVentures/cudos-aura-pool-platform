import SettingsEntity from '../entities/settings.entity';
import { SettingsJsonValidator } from '../general.types';

export class ResFetchSettings {

    settingsEntity: SettingsJsonValidator;

    constructor(settingsEntity: SettingsEntity) {
        this.settingsEntity = SettingsEntity.toJson(settingsEntity);
    }
}

export class ResCreditSettings {

    settingsEntity: SettingsJsonValidator;

    constructor(settingsEntity: SettingsEntity) {
        this.settingsEntity = SettingsEntity.toJson(settingsEntity);
    }
}
