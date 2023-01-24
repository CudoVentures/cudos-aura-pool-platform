import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
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

        await runInActionAsync(() => {
            this.inited = true;
            this.settingsEntity = settingsEntity;
        });
    }

    async creditSettings(settingsEntity: SettingsEntity) {
        await this.settingsRepo.creditSettings(settingsEntity);

        await runInActionAsync(() => {
            this.settingsEntity.copy(settingsEntity);
        });
    }

    getPercentRemainderAfterCudosFee(): BigNumber {
        return new BigNumber(1 - (this.settingsEntity.globalCudosFeesPercent / 100));
    }

}
