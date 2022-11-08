import { computed, makeAutoObservable } from 'mobx';

import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';

import S from '../../../../core/utilities/Main';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import BigNumber from 'bignumber.js';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';

const MAINTENANCE_FEE = 0.01;

export default class RewardsCalculatorStore {

    bitcoinStore: BitcoinStore;
    miningFarmRepo: MiningFarmRepo;

    miningFarmsEntities: MiningFarmEntity[];
    selectedMiningFarmEntity: MiningFarmEntity;

    networkDifficultyEdit: string;
    hashRateInTh: number;

    constructor(bitcoinStore: BitcoinStore, miningFarmRepo: MiningFarmRepo) {
        this.bitcoinStore = bitcoinStore;
        this.miningFarmRepo = miningFarmRepo;

        this.miningFarmsEntities = [];

        this.resetDefaults();

        makeAutoObservable(this);
    }

    resetDefaults() {
        this.selectedMiningFarmEntity = null;
        this.networkDifficultyEdit = S.Strings.EMPTY;
        this.hashRateInTh = 0;
    }

    isDefault() {
        if (this.selectedMiningFarmEntity !== null) {
            return false;
        }

        if (this.networkDifficultyEdit !== S.Strings.EMPTY) {
            return false;
        }

        if (this.hashRateInTh !== 0) {
            return false;
        }

        return true;
    }

    async init() {
        await this.bitcoinStore.init();

        this.resetDefaults();
        this.miningFarmsEntities = await this.miningFarmRepo.fetchAllMiningFarms();
    }

    hasNetworkDifficulty() {
        return this.networkDifficultyEdit !== S.Strings.EMPTY;
    }

    getNetworkDifficulty() {
        if (this.hasNetworkDifficulty() === true) {
            return this.networkDifficultyEdit;
        }

        return this.bitcoinStore.getNetworkDifficulty();
    }

    onChangeMiningFarm(selectedMiningFarmId: string) {
        this.selectedMiningFarmEntity = this.miningFarmsEntities.find((entity) => {
            return entity.id === selectedMiningFarmId;
        });

        this.hashRateInTh = this.selectedMiningFarmEntity.hashRateInTh;
    }

    onChangeHashRateInThSlider = (event: MouseEvent, value: number) => {
        this.hashRateInTh = value;
    }

    onChangeNetworkDifficulty = (input: string) => {
        this.networkDifficultyEdit = input;
    }

    // formatPowerCost(): string {
    //     if (this.selectedMiningFarmEntity === null) {
    //         return '-';
    //     }

    //     return this.selectedMiningFarmEntity.formatPowerCost();
    // }

    // formatPoolFee(): string {
    //     if (this.selectedMiningFarmEntity === null) {
    //         return '-';
    //     }

    //     return this.selectedMiningFarmEntity.formatPoolFee();
    // }

    // formatPowerConsumptionPerTH(): string {
    //     if (this.selectedMiningFarmEntity === null) {
    //         return '-';
    //     }

    //     return this.selectedMiningFarmEntity.formatPowerConsumptionPerTH();
    // }

    formatCost(): string {
        return `${ProjectUtils.CUDOS_FEE_IN_PERCENT + MAINTENANCE_FEE} %`;
    }

    calculateGrossRewardPerMonth(): BigNumber {
        if (this.selectedMiningFarmEntity === null) {
            return new BigNumber(0);
        }

        return this.bitcoinStore.calculateRewardsPerMonth(this.selectedMiningFarmEntity.hashRateInTh);
    }

    @computed
    calculateNetRewardPetMonth(): BigNumber {
        const fees = new BigNumber(1 - ProjectUtils.CUDOS_FEE_IN_PERCENT - MAINTENANCE_FEE);
        return this.calculateGrossRewardPerMonth().multipliedBy(fees);
    }

    formatNetRewardPerMonth(): string {
        return `${this.calculateNetRewardPetMonth().toFixed(5)} BTC`;
    }

    // calculatePowerConsumption(): number {
    //     return this.miningFarms[this.selectedFarmId].powerConsumptionPerTh * this.hashRateInTh;
    // }

    // calculateMonthlyRewardBtc(): BigNumber {
    //     // TODO: calculate
    //     return new BigNumber(1);
    // }

    // calculateBtcToUsd(btcAmount: BigNumber): BigNumber {
    //     return btcAmount.multipliedBy(this.bitcoinStore.getBitcoinPriceInUsd());
    // }

}
