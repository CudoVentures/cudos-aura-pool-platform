import { action, computed, makeAutoObservable, runInAction } from 'mobx';

import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';

import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import BigNumber from 'bignumber.js';
import BitcoinBlockchainInfoEntity from '../../../bitcoin-data/entities/BitcoinBlockchainInfoEntity';
import GeneralStore from '../../../general/presentation/stores/GeneralStore';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import { formatBtc } from '../../../core/utilities/NumberFormatter';

export default class RewardsCalculatorStore {

    bitcoinStore: BitcoinStore;
    generalStore: GeneralStore;
    miningFarmRepo: MiningFarmRepo;

    miningFarmsEntities: MiningFarmEntity[];

    selectedMiningFarmEntity: MiningFarmEntity;
    networkDifficultyEdit: BigNumber;
    hashPowerInThInputValue: string;

    constructor(bitcoinStore: BitcoinStore, generalStore: GeneralStore, miningFarmRepo: MiningFarmRepo) {
        this.bitcoinStore = bitcoinStore;
        this.generalStore = generalStore;
        this.miningFarmRepo = miningFarmRepo;

        this.miningFarmsEntities = [];

        this.resetDefaults();

        makeAutoObservable(this);
    }

    @action
    resetDefaults() {
        this.selectedMiningFarmEntity = null;
        this.networkDifficultyEdit = null;
        this.hashPowerInThInputValue = '0';
    }

    isDefault() {
        if (this.selectedMiningFarmEntity !== null) {
            return false;
        }

        if (this.networkDifficultyEdit !== null) {
            return false;
        }

        if (this.hashPowerInThInputValue !== '0') {
            return false;
        }

        return true;
    }

    async init() {
        const [miningFarmsEntities] = await Promise.all([
            this.miningFarmRepo.fetchAllMiningFarms(),
            this.bitcoinStore.init(),
            this.generalStore.init(),
        ])

        await runInActionAsync(() => {
            this.miningFarmsEntities = miningFarmsEntities
        })
    }

    hasSelectedMiningFarm(): boolean {
        return this.selectedMiningFarmEntity !== null;
    }

    getNetworkDifficultyInputValue(): string {
        return this.networkDifficultyEdit !== null ? this.networkDifficultyEdit.toString(10) : this.bitcoinStore.getNetworkDifficulty();
    }

    getHashPowerInTh(): number {
        return parseFloat(this.hashPowerInThInputValue);
    }

    onChangeMiningFarm = (selectedMiningFarmId: string) => {
        this.selectedMiningFarmEntity = this.miningFarmsEntities.find((entity) => {
            return entity.id === selectedMiningFarmId;
        });

        this.hashPowerInThInputValue = this.selectedMiningFarmEntity.hashPowerInTh.toString();
    }

    onChangeHashPowerInInput = (value: string) => {
        if (value === '') {
            this.hashPowerInThInputValue = '0';
            return;
        }

        const floatValue = parseFloat(value);
        if (floatValue < 0) {
            value = '0';
        }
        if (floatValue > this.selectedMiningFarmEntity.hashPowerInTh) {
            value = this.selectedMiningFarmEntity.hashPowerInTh.toString();
        }

        while (value[0] === '0') {
            value = value.substring(1);
        }

        this.hashPowerInThInputValue = value;
    }

    onChangeHashPowerInThSlider = (event: MouseEvent, value: number) => {
        this.hashPowerInThInputValue = value.toString();
    }

    onChangeNetworkDifficulty = (input: string) => {
        this.networkDifficultyEdit = new BigNumber(input !== '' ? input : 1);
    }

    getMaintenanceFeePerThInBtc(): BigNumber {
        if (this.selectedMiningFarmEntity === null) {
            return new BigNumber(0);
        }

        return this.selectedMiningFarmEntity.getMaintenanceFeePerThInBtc();
    }

    getHashPowerInThInputValue(): number {
        return parseInt(this.hashPowerInThInputValue);
    }

    formatCost(): string {
        if (this.selectedMiningFarmEntity === null) {
            return '-';
        }

        return `${this.selectedMiningFarmEntity.formatMaintenanceFeesInBtc()}`;
    }

    calculateGrossRewardPerMonth(): BigNumber {
        let bitcoinHashPower = null;
        if (this.networkDifficultyEdit !== null) {
            bitcoinHashPower = BitcoinBlockchainInfoEntity.getNetworkHashPowerInTh(this.networkDifficultyEdit);
        }

        return this.bitcoinStore.calculateRewardsPerMonth(this.getHashPowerInTh(), bitcoinHashPower);
    }

    calculateNetRewardPetMonth(): BigNumber {
        if (this.selectedMiningFarmEntity === null) {
            return new BigNumber(0);
        }

        const k = this.getHashPowerInTh() / this.selectedMiningFarmEntity.hashPowerInTh;
        const maintenanceFeeInBtc = new BigNumber(k).multipliedBy(this.selectedMiningFarmEntity.maintenanceFeeInBtc);
        const incomeAfterCudosFeeInBtc = this.calculateGrossRewardPerMonth().multipliedBy(this.generalStore.getPercentRemainderAfterCudosFee());
        let incomeAfterMaitenanceFeeInBtc = incomeAfterCudosFeeInBtc.minus(maintenanceFeeInBtc);

        if (incomeAfterMaitenanceFeeInBtc.lt(new BigNumber(0)) === true) {
            incomeAfterMaitenanceFeeInBtc = new BigNumber(0);
        }

        return incomeAfterMaitenanceFeeInBtc;
    }

    formatNetRewardPerMonth(): string {
        return formatBtc(this.calculateNetRewardPetMonth(), true);
    }
}
