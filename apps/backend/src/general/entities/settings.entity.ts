import { SettingsJsonValidator } from '../general.types';
import SettingsRepo, { SETTINGS_REPO_PK } from '../repos/settings.repo';

export default class SettingsEntity {

    firstSaleCudosRoyaltiesPercent: number;
    resaleCudosRoyaltiesPercent: number;
    globalCudosFeesPercent: number;
    globalCudosRoyaltiesPercent: number;

    constructor() {
        this.firstSaleCudosRoyaltiesPercent = 0;
        this.resaleCudosRoyaltiesPercent = 0;
        this.globalCudosFeesPercent = 0;
        this.globalCudosRoyaltiesPercent = 0;
    }

    hasValidRoyaltiesPrecision() {
        return hasValidPrecision(this.firstSaleCudosRoyaltiesPercent) && hasValidPrecision(this.resaleCudosRoyaltiesPercent) && hasValidPrecision(this.globalCudosFeesPercent) && hasValidPrecision(this.globalCudosRoyaltiesPercent);
    }

    static toRepo(entity: SettingsEntity): any {
        if (entity === null) {
            return null;
        }

        const repoJson = new SettingsRepo();

        repoJson.id = SETTINGS_REPO_PK;
        repoJson.firstSaleCudosRoyaltiesPercent = entity.firstSaleCudosRoyaltiesPercent;
        repoJson.resaleCudosRoyaltiesPercent = entity.resaleCudosRoyaltiesPercent;
        repoJson.globalCudosFeesPercent = entity.globalCudosFeesPercent;
        repoJson.globalCudosRoyaltiesPercent = entity.globalCudosRoyaltiesPercent;

        return repoJson;
    }

    static fromRepo(repoJson: SettingsRepo): SettingsEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new SettingsEntity();

        entity.firstSaleCudosRoyaltiesPercent = repoJson.firstSaleCudosRoyaltiesPercent ?? entity.firstSaleCudosRoyaltiesPercent;
        entity.resaleCudosRoyaltiesPercent = repoJson.resaleCudosRoyaltiesPercent ?? entity.resaleCudosRoyaltiesPercent;
        entity.globalCudosFeesPercent = repoJson.globalCudosFeesPercent ?? entity.globalCudosFeesPercent;
        entity.globalCudosRoyaltiesPercent = repoJson.globalCudosRoyaltiesPercent ?? entity.globalCudosRoyaltiesPercent;

        return entity;
    }

    static toJson(model: SettingsEntity): SettingsJsonValidator {
        if (model === null) {
            return null;
        }

        return {
            'firstSaleCudosRoyaltiesPercent': model.firstSaleCudosRoyaltiesPercent,
            'resaleCudosRoyaltiesPercent': model.resaleCudosRoyaltiesPercent,
            'globalCudosFeesPercent': model.globalCudosFeesPercent,
            'globalCudosRoyaltiesPercent': model.globalCudosRoyaltiesPercent,
        }
    }

    static fromJson(json: SettingsJsonValidator) {
        if (json === null) {
            return null;
        }

        const model = new SettingsEntity();

        model.firstSaleCudosRoyaltiesPercent = Number(json.firstSaleCudosRoyaltiesPercent ?? model.firstSaleCudosRoyaltiesPercent);
        model.resaleCudosRoyaltiesPercent = Number(json.resaleCudosRoyaltiesPercent ?? model.resaleCudosRoyaltiesPercent);
        model.globalCudosFeesPercent = Number(json.globalCudosFeesPercent ?? model.globalCudosFeesPercent);
        model.globalCudosRoyaltiesPercent = Number(json.globalCudosRoyaltiesPercent ?? model.globalCudosRoyaltiesPercent);

        return model;
    }

}

function hasValidPrecision(value) {
    return (value * 100).toFixed(0) === (value * 100).toString();
}
