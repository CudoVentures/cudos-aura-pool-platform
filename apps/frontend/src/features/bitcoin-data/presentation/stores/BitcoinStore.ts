import BitcoinDataEntity from '../../entities/BitcoinDataEntity';
import BitcoinRepo from '../repos/BitcoinRepo';

export default class BitcoinStore {

    bitcoinRepo: BitcoinRepo;

    inited: boolean;
    bitcoinDataEntity: BitcoinDataEntity;

    constructor(bitcoinRepo: BitcoinRepo) {
        this.bitcoinRepo = bitcoinRepo;

        this.inited = false;
        this.bitcoinDataEntity = null;
    }

    async init() {
        if (this.inited === true) {
            return;
        }

        this.inited = true;
        this.bitcoinDataEntity = await this.bitcoinRepo.fetchBitcoinData();
    }

    getBitcoinPrice(): number {
        return this.bitcoinDataEntity?.priceInUsd ?? 0;
    }

    getBitcoinPriceInUsd(): number {
        return this.bitcoinDataEntity?.priceInUsd ?? 0;
    }

    getBitcoinPriceChange(): number {
        return this.bitcoinDataEntity?.priceChangeInUsd ?? 0;
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

    formatBitcoinPriceChangeInPercentage(): string {
        return `${this.getBitcoinPriceChangeInPercentage().toFixed(2)} %`;
    }

    getNetworkDifficulty(): string {
        return this.bitcoinDataEntity?.networkDifficulty ?? '';
    }

    getBlockReward(): number {
        return this.bitcoinDataEntity?.blockReward ?? 0;
    }

}
