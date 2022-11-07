import { makeAutoObservable } from 'mobx';

import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';

import S from '../../../../core/utilities/Main';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';

export default class RewardsCalculatorStore {

    bitcoinStore: BitcoinStore;
    miningFarmRepo: MiningFarmRepo;

    miningFarmsEntities: MiningFarmEntity[];
    selectedMiningFarmEntity: MiningFarmEntity;

    networkDifficultyEdit: string;
    hashRateInEH: number;

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
        this.hashRateInEH = 0;
    }

    isDefault() {
        if (this.selectedMiningFarmEntity !== null) {
            return false;
        }

        if (this.networkDifficultyEdit !== S.Strings.EMPTY) {
            return false;
        }

        if (this.hashRateInEH !== 0) {
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

        this.hashRateInEH = this.selectedMiningFarmEntity.hashRateInEH;
    }

    onChangeHashRateInEHSlider = (event: MouseEvent, value: number) => {
        this.hashRateInEH = value;
    }

    onChangeNetworkDifficulty = (input: string) => {
        this.networkDifficultyEdit = input;
    }

    formatPowerCost(): string {
        if (this.selectedMiningFarmEntity === null) {
            return '-';
        }

        return this.selectedMiningFarmEntity.formatPowerCost();
    }

    formatPoolFee(): string {
        if (this.selectedMiningFarmEntity === null) {
            return '-';
        }

        return this.selectedMiningFarmEntity.formatPoolFee();
    }

    formatPowerConsumptionPerTH(): string {
        if (this.selectedMiningFarmEntity === null) {
            return '-';
        }

        return this.selectedMiningFarmEntity.formatPowerConsumptionPerTH();
    }

    // calculatePowerConsumption(): number {
    //     return this.miningFarms[this.selectedFarmId].powerConsumptionPerTh * this.hashRateInEH;
    // }

    // calculateMonthlyRewardBtc(): BigNumber {
    //     // TODO: calculate
    //     return new BigNumber(1);
    // }

    // calculateBtcToUsd(btcAmount: BigNumber): BigNumber {
    //     return btcAmount.multipliedBy(this.bitcoinStore.getBitcoinPriceInUsd());
    // }

}
