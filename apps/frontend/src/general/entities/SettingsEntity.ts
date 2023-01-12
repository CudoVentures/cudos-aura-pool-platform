import { makeAutoObservable } from 'mobx';

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

        makeAutoObservable(this);
    }

    clone(): SettingsEntity {
        return Object.assign(new SettingsEntity(), this);
    }

    copy(source: SettingsEntity) {
        Object.assign(this, source);
    }

    static toJson(model: SettingsEntity): any {
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

    static fromJson(json: any) {
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
