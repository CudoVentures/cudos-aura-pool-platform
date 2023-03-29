import CudosAuraPoolServiceRepo from './repos/CudosAuraPoolServiceRepo';
import AuraContractRepo from './repos/AuraContractRepo';
import CudosChainRepo from './repos/CudosChainRepo';
import Logger from '../../config/Logger';
import { PaymentStatus } from '../entities/PaymentEventEntity';
import Config from '../../config/Config';
import BigNumber from 'bignumber.js';
import CryptoCompareRepo from './repos/CryptoCompareRepo';

export default class ContractEventWorker {
    static WORKER_NAME = 'CONTRACT_EVENT_WORKER';
    static FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;

    coinGeckoRepo: CryptoCompareRepo;
    cudosChainRepo: CudosChainRepo;
    contractRepo: AuraContractRepo;
    cudosAuraPoolServiceApi: CudosAuraPoolServiceRepo;

    ethUsdPrice: number;
    cudosEthPrice: BigNumber;
    lastUpdatedPricesTimestamp: number;

    constructor(coinGeckoRepo: CryptoCompareRepo, cudosChainRepo: CudosChainRepo, contractRepo: AuraContractRepo, cudosAuraPoolServiceApi: CudosAuraPoolServiceRepo) {
        this.coinGeckoRepo = coinGeckoRepo;
        this.cudosChainRepo = cudosChainRepo;
        this.contractRepo = contractRepo;
        this.cudosAuraPoolServiceApi = cudosAuraPoolServiceApi;

        this.ethUsdPrice = 1;
        this.cudosEthPrice = null;
        this.lastUpdatedPricesTimestamp = 0;
    }

    async run() {
        try {
            // get last checked eth block
            ContractEventWorker.log('Fetching last checked block height...');
            const lastCheckedBlock = await this.cudosAuraPoolServiceApi.fetchLastCheckedEthereumBlock();
            ContractEventWorker.log(`Last checked block: ${lastCheckedBlock}`);

            if (!lastCheckedBlock || lastCheckedBlock < 1) {
                throw Error(`Invalid last checked block height: ${lastCheckedBlock}`);
            }

            ContractEventWorker.log('Fetching current Ethereum block height...');
            const currentEthereumBlock = await this.contractRepo.fetchCurrentBlockHeight();
            ContractEventWorker.log(`Current Ethereum block height: ${currentEthereumBlock}`);

            if (!currentEthereumBlock || currentEthereumBlock < 1) {
                throw Error(`Invalid current Ethereum block height: ${currentEthereumBlock}`);
            }

            if (lastCheckedBlock > currentEthereumBlock) {
                throw Error(`Invalid state: Last checked block higher than current Ethereum block.\n\tLast checked block: ${lastCheckedBlock}\n\tCurrent Ethereum block: ${currentEthereumBlock}`);
            }

            if (lastCheckedBlock === currentEthereumBlock) {
                ContractEventWorker.log('No new block yet. Skipping this check.');
                return;
            }

            // get all payments events since that block
            ContractEventWorker.log('Fetching paymentEventEntities from contract...');
            const paymentEventEntities = await this.contractRepo.fetchEvents(lastCheckedBlock + 1, currentEthereumBlock);
            paymentEventEntities.forEach((entity) => {
                if (entity.isValid() === false) {
                    throw Error(`Invalid transaction parsed: ${JSON.stringify(entity)}`);
                }
            })

            if (paymentEventEntities.length !== 0) {
                // for each event
                ContractEventWorker.log('Processing events...');

                if (this.lastUpdatedPricesTimestamp + ContractEventWorker.FIFTEEN_MINUTES_IN_MS < Date.now()) {
                    ContractEventWorker.log('Getting USD/ETH price for calculations...');
                    this.ethUsdPrice = await this.coinGeckoRepo.fetchEthUsdPrice();
                    ContractEventWorker.log(`Current USD/ETH price is: $ ${this.ethUsdPrice}`);

                    ContractEventWorker.log('Getting ETH/CUDOS price for calculations...');
                    this.cudosEthPrice = await this.coinGeckoRepo.fetchCudosEthPrice();
                    ContractEventWorker.log(`Current ETH/CUDOS price is: $ ${this.cudosEthPrice.toString(10)}`);

                    this.lastUpdatedPricesTimestamp = Date.now();
                }

                // expected price is set price +- epsilon in %
                const setPriceUsd = Config.EXPECTED_PRICE_USD;
                const expectedPriceEth = (new BigNumber(setPriceUsd)).dividedBy(this.ethUsdPrice);
                const priceEthEpsilon = expectedPriceEth.multipliedBy(Config.EXPECTED_PRICE_EPSILON_PERCENT);
                const expectedEthPriceLowerBand = expectedPriceEth.minus(priceEthEpsilon);
                const expectedEthPriceUpperBand = expectedPriceEth.plus(priceEthEpsilon);

                ContractEventWorker.log(`Expected price is: $${setPriceUsd} = ${expectedPriceEth} ETH`);
                ContractEventWorker.log(`Price epsilon is: ${Config.EXPECTED_PRICE_EPSILON_PERCENT}% = ${priceEthEpsilon} ETH as current price.`);
                ContractEventWorker.log(`Expecting received payment to be >= ${expectedEthPriceLowerBand} AND <= ${expectedEthPriceUpperBand}`);

                for (let i = 0; i < paymentEventEntities.length; i++) {
                    const paymentEventEntity = paymentEventEntities[i];
                    const receivedEthAmount = paymentEventEntity.amount;

                    // checks for refund
                    let shouldRefund = false;

                    // - Is the received amount equal to the expected?
                    if (shouldRefund === false && (receivedEthAmount.lt(expectedEthPriceLowerBand) === true || receivedEthAmount.gt(expectedEthPriceUpperBand) === true)) {
                        ContractEventWorker.warn(`\tPayed amount to contract is not within the expected band.\n\t\tPayed amount: ${receivedEthAmount.toString(10)}\n\t\tExpected to be between: ${expectedEthPriceLowerBand.toString(10)} AND ${expectedEthPriceUpperBand.toString(10)}`);
                        shouldRefund = true;
                    }

                    if (shouldRefund === false) {
                        // - is the given adress in addressbook with BTC address?
                        ContractEventWorker.log('\tGetting addressbook entry for payment cudos address...');
                        const addressbookEntry = await this.cudosChainRepo.fetchAddressbookEntry(paymentEventEntity.cudosAddress);
                        if (!addressbookEntry || addressbookEntry.isValid() === false) {
                            ContractEventWorker.warn(`\tAddressbook entry not found for payment nft id.\n\t\tPayment cudos address: ${paymentEventEntity.cudosAddress}`);
                            shouldRefund = true;
                        }
                    }

                    // if check fails, unlock payment
                    if (shouldRefund === true) {
                        ContractEventWorker.warn('\tMarking payment for refunding...');
                        const status = await this.contractRepo.fetchPaymentStatus(paymentEventEntity.id);
                        if (status === PaymentStatus.LOCKED) {
                            const txhash = await this.contractRepo.markPaymentWithdrawable(paymentEventEntity.id);
                            ContractEventWorker.log(`\tPaymentId ${paymentEventEntity.id} marked as refunded. TxHash: ${txhash}`);

                        } else {
                            ContractEventWorker.log(`\tPaymentId ${paymentEventEntity.id} is already not locked.`);
                        }

                        // if the checks pass, send payment to on demand minting service
                    } else {
                        ContractEventWorker.log('\tGoing to mint an nft.');
                        const convertedPaymentToCudos = receivedEthAmount.dividedBy(this.cudosEthPrice);
                        ContractEventWorker.log(`\tReceived payment is ${receivedEthAmount.toString(10)} ETH = ${convertedPaymentToCudos.toString(10)} CUDOS in current prices`)
                        ContractEventWorker.log('\tSending on demand minting Tx...')
                        const txhash = await this.cudosChainRepo.sendOnDemandMintingTx(paymentEventEntity, convertedPaymentToCudos);
                        ContractEventWorker.log(`\tPaymentId ${paymentEventEntity.id} sent for mint to on demand minting service. TxHash: ${txhash}`);
                    }
                }

            } else {
                ContractEventWorker.log(`No events found until curren block. Block number: ${currentEthereumBlock}`);
            }

            // save last checked block
            ContractEventWorker.log(`Saving last checked Ethereum block: ${currentEthereumBlock}`);
            this.cudosAuraPoolServiceApi.updateLastCheckedEthereumBlock(currentEthereumBlock);
            ContractEventWorker.log('Run finished.');
        } catch (e) {
            ContractEventWorker.error(e);
        }
    }

    static log(msg) {
        Logger.info(`${ContractEventWorker.WORKER_NAME}: ${msg}`);
    }

    static warn(...msg) {
        Logger.warn(`${ContractEventWorker.WORKER_NAME}: ${msg}`);
    }

    static error(msg) {
        Logger.error(msg);
    }
}
