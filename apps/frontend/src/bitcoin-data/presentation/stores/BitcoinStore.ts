import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import BitcoinDataEntity from '../../entities/BitcoinDataEntity';
import BitcoinRepo from '../repos/BitcoinRepo';
import ProjectUtils, { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import BitcoinBlockchainInfoEntity from '../../entities/BitcoinBlockchainInfoEntity';
import { formatBtc, formatPercent, formatUsd } from '../../../core/utilities/NumberFormatter';

export const BLOCKS_PER_DAY = 6 * 24
export const BLOCKS_PER_WEEK = 6 * 24 * 7;
export const BLOCKS_PER_MONTH = BLOCKS_PER_DAY * 30;
export const BLOCKS_PER_YEAR = BLOCKS_PER_DAY * 365;

export default class BitcoinStore {

    bitcoinRepo: BitcoinRepo;

    inited: boolean;
    bitcoinDataEntity: BitcoinDataEntity;
    bitcoinBlockchainInfoEntity: BitcoinBlockchainInfoEntity;

    constructor(bitcoinRepo: BitcoinRepo) {
        this.bitcoinRepo = bitcoinRepo;

        this.inited = false;
        this.bitcoinDataEntity = null;
        this.bitcoinBlockchainInfoEntity = null;

        makeAutoObservable(this);
    }

    async init() {
        if (this.inited === true) {
            return;
        }

        const bitcoinDataEntity = await this.bitcoinRepo.fetchBitcoinData();
        const bitcoinBlockchainInfoEntity = await this.bitcoinRepo.fetchBitcoinBlockchainInfo();

        await runInActionAsync(() => {
            this.inited = true;
            this.bitcoinDataEntity = bitcoinDataEntity;
            this.bitcoinBlockchainInfoEntity = bitcoinBlockchainInfoEntity;
        })
    }

    getBitcoinPriceInUsd(): number {
        return this.bitcoinDataEntity?.priceInUsd ?? 0;
    }

    getBitcoinPriceChangeInUsd(): number {
        return this.bitcoinDataEntity?.priceChangeInUsd ?? 0;
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
        return formatUsd(btc.multipliedBy(this.bitcoinDataEntity?.priceInUsd ?? 0).toNumber());
    }

    formatBitcoinPriceChangeInPercentage(): string {
        return formatPercent(this.getBitcoinPriceChangeInPercentage(), true);
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
