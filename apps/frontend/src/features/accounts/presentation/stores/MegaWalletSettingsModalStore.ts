import { isValidAddress } from 'cudosjs';
import { action, makeObservable, observable } from 'mobx';
import ModalStore from '../../../../core/presentation/stores/ModalStore';
import GeneralStore from '../../../general/presentation/stores/GeneralStore';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import AccountSessionStore from './AccountSessionStore';

export enum MegaWalletSettings {
    ADRESS = '1',
    GLOBAL_ROYALTIES = '2',
    GLOBAL_FEES = '3',
    RESALE_FEES = '4',
    FIRST_SALE_FEE = '5',
}

export default class MegaWalletSettingsModalStore extends ModalStore {
    accountSessionStore: AccountSessionStore;
    generalStore: GeneralStore

    @observable superAdminEntity: SuperAdminEntity;
    @observable value: string;
    @observable settingType: MegaWalletSettings;

    constructor(accountSessionStore: AccountSessionStore, generalStore: GeneralStore) {
        super();

        this.accountSessionStore = accountSessionStore;
        this.generalStore = generalStore;

        // this.superAdminEntity = null;
        this.value = null;
        this.settingType = null;

        makeObservable(this);
    }

    @action
    showSignal(settingType: MegaWalletSettings) {
        // this.superAdminEntity = superAdminEntity;

        if (this.isSettingTypeAddress()) {
            this.value = this.accountSessionStore.superAdminEntity.cudosRoyalteesAddress;
        }

        this.settingType = settingType;

        this.value = this.getCurrentValue();

        this.show();
    }

    hide = action(() => {
        this.value = null;
        this.settingType = null;
        // this.superAdminEntity = null;

        super.hide();
    })

    getCurrentValue(): string {
        if (this.isSettingTypeFirstSaleFees()) {
            return this.generalStore.settingsEntity.firstSaleCudosRoyaltiesPercent.toString();
        }

        if (this.isSettingTypeResaleFees()) {
            return this.generalStore.settingsEntity.resaleCudosRoyaltiesPercent.toString();
        }

        if (this.isSettingTypeGlobalRoyalties()) {
            return this.generalStore.settingsEntity.globalCudosRoyaltiesPercent.toString();
        }

        if (this.isSettingTypeGlobalFees()) {
            return this.generalStore.settingsEntity.globalCudosFeesPercent.toString();
        }

        if (this.isSettingTypeAddress()) {
            return this.accountSessionStore.superAdminEntity.cudosRoyalteesAddress;
        }

        return '';
    }

    isSettingTypeAddress(): boolean {
        return this.settingType === MegaWalletSettings.ADRESS;
    }

    isSettingTypeGlobalFees(): boolean {
        return this.settingType === MegaWalletSettings.GLOBAL_FEES;
    }

    isSettingTypeGlobalRoyalties(): boolean {
        return this.settingType === MegaWalletSettings.GLOBAL_ROYALTIES;
    }

    isSettingTypeFirstSaleFees(): boolean {
        return this.settingType === MegaWalletSettings.FIRST_SALE_FEE;
    }

    isSettingTypeResaleFees(): boolean {
        return this.settingType === MegaWalletSettings.RESALE_FEES;
    }

    onInputChange = action((input: string) => {
        this.value = input;
    })

    onSubmit = action(async () => {
        try {
            if (this.isSettingTypeAddress() === true) {
                if (!isValidAddress(this.value)) {
                    return;
                }
                const superAdminEntity = this.accountSessionStore.superAdminEntity.clone();
                superAdminEntity.cudosRoyalteesAddress = this.value;
                await this.accountSessionStore.editSessionSuperAdmin(superAdminEntity);
            } else {
                const settingsEntity = this.generalStore.settingsEntity.clone();

                if (this.isSettingTypeGlobalRoyalties() === true) {
                    settingsEntity.globalCudosRoyaltiesPercent = parseFloat(this.value);
                }

                if (this.isSettingTypeGlobalFees() === true) {
                    settingsEntity.globalCudosFeesPercent = parseFloat(this.value);
                }

                if (this.isSettingTypeFirstSaleFees() === true) {
                    settingsEntity.firstSaleCudosRoyaltiesPercent = parseFloat(this.value);
                }

                if (this.isSettingTypeResaleFees() === true) {
                    settingsEntity.resaleCudosRoyaltiesPercent = parseFloat(this.value);
                }

                await this.generalStore.creditSettings(settingsEntity);
            }

            this.hide();
        } catch (e) {
            console.log(e);
        }
    })
}
