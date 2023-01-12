import BigNumber from 'bignumber.js';
import { makeAutoObservable, runInAction } from 'mobx';
import SettingsEntity from '../../entities/SettingsEntity';
import SettingsRepo from '../repos/SettingsRepo';

export default class GeneralStore {

    settingsRepo: SettingsRepo;

    inited: boolean;
    settingsEntity: SettingsEntity;

    constructor(settingsRepo: SettingsRepo) {
        this.settingsRepo = settingsRepo;

        this.inited = false;
        this.settingsEntity = new SettingsEntity();

        makeAutoObservable(this);
    }

    async init() {
        if (this.inited === true) {
            return;
        }

        const settingsEntity = await this.settingsRepo.fetchSettings();

        runInAction(() => {
            this.inited = true;
            this.settingsEntity = settingsEntity;
        });
    }

    async creditSettings(settingsEntity: SettingsEntity) {
        await this.settingsRepo.creditSettings(settingsEntity);

        runInAction(() => {
            this.settingsEntity.copy(settingsEntity);
        });
    }

    getPercentRemainderAfterCudosFee(): BigNumber {
        return new BigNumber(1 - this.settingsEntity.globalCudosFeesPercent);
    }

}
