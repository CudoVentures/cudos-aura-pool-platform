import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';
import BitcoinCoinGeckoEntity from '../../entities/BitcoinCoinGeckoEntity';
import BitcoinRepo from '../repos/BitcoinRepo';
import ProjectUtils, { runInActionAsync } from '../../../core/utilities/ProjectUtils';
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

        const bitcoinCoinGeckoEntity = await this.bitcoinRepo.fetchBitcoinCoinGecko();
        const bitcoinBlockchainInfoEntity = await this.bitcoinRepo.fetchBitcoinBlockchainInfo();

        await runInActionAsync(() => {
            this.inited = true;
            this.bitcoinCoinGeckoEntity = bitcoinCoinGeckoEntity;
            this.bitcoinBlockchainInfoEntity = bitcoinBlockchainInfoEntity;
        })
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

    convertBtcInUsd(btc: BigNumber): BigNumber {
        return btc.multipliedBy(this.getBitcoinPriceInUsd());
    }

    formatBtcInUsd(btc: BigNumber): string {
        return numeral(btc.multipliedBy(this.bitcoinCoinGeckoEntity?.priceInUsd ?? 0).toString(10)).format(ProjectUtils.NUMERAL_USD);
    }

    formatBitcoinPriceChangeInPercentage(): string {
        return `${this.getBitcoinPriceChangeInPercentage().toFixed(2)} %`;
    }

    static formatBtc(btc: BigNumber): string {
        return `${btc.toFixed(8, BigNumber.ROUND_FLOOR)} BTC`;
    }

    static formatBtcWithPrecision(btc: BigNumber, decimals: number): string {
        return `${btc.toFixed(decimals)} BTC`;
    }

    getNetworkDifficulty(): string {
        return this.bitcoinBlockchainInfoEntity?.networkDifficulty.toString() ?? '';
    }

    getNetworkHashPowerInTh(): number {
        return this.bitcoinBlockchainInfoEntity?.networkHashPowerInTh ?? 1;
    }

    getBlockReward(): number {
        return this.bitcoinBlockchainInfoEntity?.blockReward ?? 0;
    }

    calculateRewardsPerBlock(targetHashPowerInTh: number, bitcoinHashPower: BigNumber = null): BigNumber {
        const blockReward = new BigNumber(this.getBlockReward());
        const hashPower = new BigNumber(targetHashPowerInTh);
        if (bitcoinHashPower === null) {
            bitcoinHashPower = new BigNumber(this.getNetworkHashPowerInTh());
        }

        return hashPower.dividedBy(bitcoinHashPower).multipliedBy(blockReward);
    }

    calculateRewardsPerDay(targetHashPowerInTh: number, bitcoinHashPower: BigNumber = null): BigNumber {
        return this.calculateRewardsPerBlock(targetHashPowerInTh, bitcoinHashPower).multipliedBy(BLOCKS_PER_DAY);
    }

    calculateRewardsPerWeek(targetHashPowerInTh: number, bitcoinHashPower: BigNumber = null): BigNumber {
        return this.calculateRewardsPerBlock(targetHashPowerInTh, bitcoinHashPower).multipliedBy(BLOCKS_PER_WEEK);
    }

    calculateRewardsPerMonth(targetHashPowerInTh: number, bitcoinHashPower: BigNumber = null): BigNumber {
        return this.calculateRewardsPerBlock(targetHashPowerInTh, bitcoinHashPower).multipliedBy(BLOCKS_PER_MONTH);
    }

    calculateRewardsPerYear(targetHashPowerInTh: number, bitcoinHashPower: BigNumber = null): BigNumber {
        return this.calculateRewardsPerBlock(targetHashPowerInTh, bitcoinHashPower).multipliedBy(BLOCKS_PER_YEAR);
    }

}
