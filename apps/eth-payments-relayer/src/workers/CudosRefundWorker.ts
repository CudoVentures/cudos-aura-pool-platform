import CudosAuraPoolServiceRepo from './repos/CudosAuraPoolServiceRepo';
import CudosChainRepo from './repos/CudosChainRepo';
import AuraContractRepo from './repos/AuraContractRepo';
import Logger from '../../config/Logger';
import { PaymentStatus } from '../entities/PaymentEventEntity';

export default class CudosRefundWorker {
    static WORKER_NAME = 'CUDOS_REFUND_WORKER';

    cudosChainRepo: CudosChainRepo;
    contractRepo: AuraContractRepo;
    cudosAuraPoolServiceApi: CudosAuraPoolServiceRepo;

    constructor(cudosChainRepo: CudosChainRepo, contractRepo: AuraContractRepo, cudosAuraPoolServiceApi: CudosAuraPoolServiceRepo) {
        this.cudosChainRepo = cudosChainRepo;
        this.contractRepo = contractRepo;
        this.cudosAuraPoolServiceApi = cudosAuraPoolServiceApi;
    }

    async run() {
        try {
            // get last checked eth block
            CudosRefundWorker.log('Fetching last checked block height...');
            const lastCheckedBlock = await this.cudosAuraPoolServiceApi.fetchLastCheckedPaymentRelayerCudosBlock();
            CudosRefundWorker.log(`Last checked block: ${lastCheckedBlock}`);

            if (!lastCheckedBlock || lastCheckedBlock < 1) {
                throw Error(`Invalid last checked block height: ${lastCheckedBlock}`);
            }

            // get current block
            CudosRefundWorker.log('Fetching current Cudos block height...');
            const currentCudosBlock = await this.cudosChainRepo.fetchCurrentBlockHeight();
            CudosRefundWorker.log(`Current Cudos block height: ${currentCudosBlock}`);

            if (!currentCudosBlock || currentCudosBlock < 1) {
                throw Error(`Invalid current Cudos block height: ${currentCudosBlock}`);
            }

            if (lastCheckedBlock > currentCudosBlock) {
                throw Error(`Invalid state: Last checked block higher than current Cudos block.\n\tLast checked block: ${lastCheckedBlock}\n\tCurrent Cudos block: ${currentCudosBlock}`);
            }

            if (lastCheckedBlock > currentCudosBlock) {
                CudosRefundWorker.log('No new block yet. Skipping this check.');
                return;
            }

            // get all refund transactions from on demand minting address
            CudosRefundWorker.log('Fetching refund transactions...');
            const refundTransactionEntities = await this.cudosChainRepo.fetchRefundTransactions(lastCheckedBlock, currentCudosBlock);
            refundTransactionEntities.forEach((entity) => {
                if (entity.isValid() === false) {
                    throw Error(`Invalid transaction parsed: ${JSON.stringify(entity)}`);
                }
            })
            CudosRefundWorker.log(`Fetched ${refundTransactionEntities.length} refund transactions.`);

            if (refundTransactionEntities.length !== 0) {
                CudosRefundWorker.log('Marking payments on the contract as withdrawable...');
                // for each tx
                for (let i = 0; i < refundTransactionEntities.length; i++) {
                    const refundTransactionEntity = refundTransactionEntities[i];

                    // get original payment transactions by txHash in the refund transactions
                    CudosRefundWorker.log('Fetching original payment transaction...');
                    const paymentTxHash = refundTransactionEntity.refundedTxHash;
                    const paymentTransactionEntity = await this.cudosChainRepo.fetchPaymentTransactionByTxhash(paymentTxHash);
                    if (!paymentTransactionEntity || paymentTransactionEntity.isValid() === false) {
                        throw Error(`Invalid transaction parsed:\n\tTxHash: ${paymentTxHash}\n\tParsed entity: ${JSON.stringify(paymentTransactionEntity)}`);
                    }

                    // unlock payment
                    CudosRefundWorker.log(`Processing payment for paymentId: ${paymentTransactionEntity.contractPaymentId}`);
                    const status = await this.contractRepo.fetchPaymentStatus(paymentTransactionEntity.contractPaymentId);
                    if (status === PaymentStatus.LOCKED) {
                        const txHash = await this.contractRepo.markPaymentWithdrawable(paymentTransactionEntity.contractPaymentId);
                        CudosRefundWorker.log(`Payment unlocked. Txhash: ${txHash}`);
                    } else {
                        CudosRefundWorker.log('Payment ALREADY unlocked.');
                    }
                }
            } else {
                CudosRefundWorker.log(`No events found until curren block. Block number: ${currentCudosBlock}`);
            }

            // save last checked block
            CudosRefundWorker.log(`Saving last checked cudos block: ${currentCudosBlock}`);
            this.cudosAuraPoolServiceApi.updateLastCheckedCudosRefundBlock(currentCudosBlock);
            CudosRefundWorker.log('Run finished.');
        } catch (e) {
            CudosRefundWorker.error(e.message);
        }
    }

    static log(...msg) {
        Logger.info(`${CudosRefundWorker.WORKER_NAME}: ${msg}`);
    }

    static warn(...msg) {
        Logger.warn(`${CudosRefundWorker.WORKER_NAME}: ${msg}`);
    }

    static error(...msg) {
        Logger.error(`${CudosRefundWorker.WORKER_NAME}: ${msg}`);
    }
}
