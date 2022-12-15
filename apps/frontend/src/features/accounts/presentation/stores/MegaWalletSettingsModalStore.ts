import { isValidAddress } from 'cudosjs';
import { action, makeObservable, observable } from 'mobx';
import ModalStore from '../../../../core/presentation/stores/ModalStore';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import AccountSessionStore from './AccountSessionStore';

export enum MegaWalletSettings {
    ADRESS = '1',
    GLOBAL_ROYALTIES = '2',
    GLOBAL_FEES = '3',
    RESALE_FEES = '4',
    FIRST_SALE_FEE = '5',
    TRANSFER = '6',
    DEPOSIT = '7'
}

export default class MegaWalletSettingsModalStore extends ModalStore {
    accountSessionStore: AccountSessionStore;

    @observable superAdminEntity: SuperAdminEntity;
    @observable value: string;
    @observable settingType: MegaWalletSettings;

    constructor(accountSessionStore: AccountSessionStore) {
        super();

        this.accountSessionStore = accountSessionStore;

        this.superAdminEntity = null;
        this.value = null;
        this.settingType = null;

        makeObservable(this);
    }

    @action
    showSignal(
        superAdminEntity: SuperAdminEntity,
        settingType: MegaWalletSettings,
    ) {
        this.superAdminEntity = superAdminEntity;

        if (this.isSettingTypeAddress()) {
            this.value = superAdminEntity.cudosRoyalteesAddress;
        }

        this.settingType = settingType;

        this.value = this.getCurrentValue();

        this.show();
    }

    hide = () => {
        this.value = null;
        this.settingType = null;
        this.superAdminEntity = null;

        super.hide();
    }

    getCurrentValue(): string {
        if (this.isSettingTypeFirstSaleFees()) {
            return this.superAdminEntity.firstSaleCudosRoyaltiesPercent.toString();
        }

        if (this.isSettingTypeResaleFees()) {
            return this.superAdminEntity.resaleCudosRoyaltiesPercent.toString();
        }

        if (this.isSettingTypeGlobalRoyalties()) {
            return this.superAdminEntity.globalCudosRoyaltiesPercent.toString();
        }

        if (this.isSettingTypeGlobalFees()) {
            return this.superAdminEntity.globalCudosFeesPercent.toString();
        }

        if (this.isSettingTypeAddress()) {
            return this.superAdminEntity.cudosRoyalteesAddress;
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

    isSettingTransfer(): boolean {
        return this.settingType === MegaWalletSettings.TRANSFER;
    }

    isSettingDeposit(): boolean {
        return this.settingType === MegaWalletSettings.DEPOSIT;
    }

    onInputChange = (input) => {
        this.value = input;
    }

    onSubmit = async () => {
        const superAdminEntity = new SuperAdminEntity();
        Object.assign(superAdminEntity, this.superAdminEntity);

        try {
            if (this.isSettingTypeAddress() === true) {
                if (!isValidAddress(this.value)) {
                    return;
                }
                superAdminEntity.cudosRoyalteesAddress = this.value;
            }

            if (this.isSettingTypeGlobalRoyalties() === true) {
                superAdminEntity.globalCudosRoyaltiesPercent = parseFloat(this.value);
            }

            if (this.isSettingTypeGlobalFees() === true) {
                superAdminEntity.globalCudosFeesPercent = parseFloat(this.value);
            }

            if (this.isSettingTypeFirstSaleFees() === true) {
                superAdminEntity.firstSaleCudosRoyaltiesPercent = parseFloat(this.value);
            }

            if (this.isSettingTypeResaleFees() === true) {
                superAdminEntity.resaleCudosRoyaltiesPercent = parseFloat(this.value);
            }

            await this.accountSessionStore.editSuperAdminAccount(superAdminEntity);
            Object.assign(this.superAdminEntity, superAdminEntity);

            this.hide();
        } catch (e) {
            console.log(e);
        }
    }
}
