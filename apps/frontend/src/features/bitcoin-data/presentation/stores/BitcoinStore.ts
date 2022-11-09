import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';
import BitcoinCoinGeckoEntity from '../../entities/BitcoinCoinGeckoEntity';
import BitcoinRepo from '../repos/BitcoinRepo';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import BitcoinBlockchainInfoEntity from '../../entities/BitcoinBlockchainInfoEntity';

export const BLOCKS_PER_DAY = 6 * 24
export const BLOCKS_PER_WEEK = 6 * 24 * 7;
export const BLOCKS_PER_MONTH = BLOCKS_PER_DAY * 30;
export const BLOCKS_PER_YEAR = BLOCKS_PER_DAY * 365;

export default class BitcoinStore {

    bitcoinRepo: BitcoinRepo;

    inited: boolean;
    bitcoinCoinGeckoEntity: BitcoinCoinGeckoEntity;
    bitcoinBlockchainInfoEntity: BitcoinBlockchainInfoEntity;

    constructor(bitcoinRepo: BitcoinRepo) {
        this.bitcoinRepo = bitcoinRepo;

        this.inited = false;
        this.bitcoinCoinGeckoEntity = null;
        this.bitcoinBlockchainInfoEntity = null;

        makeAutoObservable(this);
    }

    async init() {
        if (this.inited === true) {
            return;
        }

        this.inited = true;
        this.bitcoinCoinGeckoEntity = await this.bitcoinRepo.fetchBitcoinCoinGecko();
        this.bitcoinBlockchainInfoEntity = await this.bitcoinRepo.fetchBitcoinBlockchainInfo();
    }

    getBitcoinPriceInUsd(): number {
        return this.bitcoinCoinGeckoEntity?.priceInUsd ?? 0;
    }

    getBitcoinPriceChangeInUsd(): number {
        return this.bitcoinCoinGeckoEntity?.priceChangeInUsd ?? 0;
    }

    getBitcoinPriceChangeInPercentage(): number {
        const priceInUsd = this.getBitcoinPriceInUsd();
        const priceChangeInUsd = this.getBitcoinPriceChangeInUsd();

        if (priceInUsd === 0) {
            return 0;
        }

        return (priceChangeInUsd / priceInUsd) * 100;
    }

    formatBtcInUsd(btcPrice: BigNumber): string {
        return numeral(btcPrice.multipliedBy(this.bitcoinCoinGeckoEntity?.priceInUsd ?? 0)).format(ProjectUtils.NUMERAL_USD);
    }

    formatBitcoinPriceChangeInPercentage(): string {
        return `${this.getBitcoinPriceChangeInPercentage().toFixed(2)} %`;
    }

    getNetworkDifficulty(): string {
        return this.bitcoinBlockchainInfoEntity?.networkDifficulty.toString() ?? '';
    }

    getNetworkHashRateInTh(): number {
        return this.bitcoinBlockchainInfoEntity?.networkHashRateInTh ?? 1;
    }

    getBlockReward(): number {
        return this.bitcoinBlockchainInfoEntity?.blockReward ?? 0;
    }

    calculateRewardsPerBlock(targetHashRateInTh: number): BigNumber {
        const blockReward = new BigNumber(this.getBlockReward());
        const hashRate = new BigNumber(targetHashRateInTh);
        const bitcoinHashRate = new BigNumber(this.getNetworkHashRateInTh());
        return hashRate.dividedBy(bitcoinHashRate).multipliedBy(blockReward);
    }

    calculateRewardsPerDay(targetHashRateInTh: number): BigNumber {
        return this.calculateRewardsPerBlock(targetHashRateInTh).multipliedBy(BLOCKS_PER_DAY);
    }

    calculateRewardsPerWeek(targetHashRateInTh: number): BigNumber {
        return this.calculateRewardsPerBlock(targetHashRateInTh).multipliedBy(BLOCKS_PER_WEEK);
    }

    calculateRewardsPerMonth(targetHashRateInTh: number): BigNumber {
        return this.calculateRewardsPerBlock(targetHashRateInTh).multipliedBy(BLOCKS_PER_MONTH);
    }

    calculateRewardsPerYear(targetHashRateInTh: number): BigNumber {
        return this.calculateRewardsPerBlock(targetHashRateInTh).multipliedBy(BLOCKS_PER_YEAR);
    }

}
