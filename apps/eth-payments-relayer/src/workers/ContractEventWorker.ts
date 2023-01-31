import CudosAuraPoolServiceRepo from './repos/CudosAuraPoolServiceRepo';
import AuraContractRepo from './repos/AuraContractRepo';
import CudosChainRepo from './repos/CudosChainRepo';

export default class ContractEventWorker {
    static WORKER_NAME = 'CONTRACT_EVENT_WORKER';

    cudosChainRepo: CudosChainRepo;
    contractRepo: AuraContractRepo;
    cudosAuraPoolServiceApi: CudosAuraPoolServiceRepo;

    constructor(cudosChainRepo: CudosChainRepo, cudosAuraPoolServiceApi: CudosAuraPoolServiceRepo) {
        this.cudosChainRepo = cudosChainRepo;
        this.cudosAuraPoolServiceApi = cudosAuraPoolServiceApi;
    }

    async run() {
        try {
            // get last checked eth block
            ContractEventWorker.log('Fetching last checked block height...');
            const lastCheckedBlock = await this.cudosAuraPoolServiceApi.fetchLastCheckedEthereumBlock();
            ContractEventWorker.log('Last checked block: ', lastCheckedBlock);

            ContractEventWorker.log('Fetching current Ethereum block height...');
            const currentEthereumBlock = await this.contractRepo.fetchCurrentBlockHeight();
            ContractEventWorker.log('Current Ethereum block height: ', currentEthereumBlock);

            // get all payments events since that block
            // const paymentEvents = await this.contract.queryFilter('NftMinted', lastCheckedBlock);
            ContractEventWorker.log('Fetching paymentEventEntities from contract...');
            const paymentEventEntities = await this.contractRepo.fetchEventsAfterBlock(lastCheckedBlock);
            const paymentNftIds = paymentEventEntities.map((entity) => entity.nftId);
            ContractEventWorker.log(`Fetched ${paymentNftIds.length} events with the following nft ids: `, paymentNftIds);

            if (paymentEventEntities.length !== 0) {
                // get all nfts data for the events
                ContractEventWorker.log('Fetching nft entitities per ids...');
                const nftEntityMap = await this.cudosAuraPoolServiceApi.fetchNftsMapByIds(paymentEventEntities.map((entity) => entity.nftId));
                ContractEventWorker.log(`Fetched ${nftEntityMap.size} nft entities from Aura Pool backend`);

                // for each event
                ContractEventWorker.log('Processing events...');
                for (let i = 0; i < paymentEventEntities.length; i++) {
                    const paymentEventEntity = paymentEventEntities[i];
                    const nftId = paymentEventEntity.nftId;

                    ContractEventWorker.log('\tProcessing event with nft id: ', nftId);
                    const nftEntity = nftEntityMap.get(nftId);

                    // checks for valid data
                    if (!nftEntity) {
                        throw Error(`Nft entity with id ${nftId} not fetched.`);
                    }

                    if (!nftEntity.isBasicValid()) {
                        throw Error(`Nft entity with id ${nftId} has invalid data.\n ${nftEntity}`);
                    }

                    // checks for refund
                    let shouldRefund = false;

                    // - Is the price still valid by the price validity timestamp?
                    if (nftEntity.isPriceValidNow() === false) {
                        ContractEventWorker.warn(`\tNft price validity expired.\n\t\tNftId: ${nftId}\n\t\tValidity timestamp: ${nftEntity.priceValidUntil}\n\t\tCurrent timestamp: ${Date.now()}`);
                        shouldRefund = true;
                    }

                    // - Is the NFT still not minted? (it may be minted before from the chain for example)
                    if (nftEntity.isStatusQueued() === false) {
                        ContractEventWorker.warn(`\tNft is not with status "queued".\n\t\tNftId: ${nftId}\n\t\tNft status: ${nftEntity.status}`);
                        shouldRefund = true;
                    }

                    // - Is the received amount equal to the expected?
                    if (nftEntity.priceInEth.isEqualTo(paymentEventEntity.amount) === false) {
                        ContractEventWorker.warn(`\tPayed amount to contract is not equal to the expected.\n\t\tNftId: ${nftId}\n\t\tPayed amount: ${paymentEventEntity.amount.toString(10)}\n\t\tExpected amount: ${nftEntity.priceInEth.toString(10)}`);
                        shouldRefund = true;
                    }

                    // - is the given adress in addressbook with BTC address?
                    ContractEventWorker.log('\tGetting addressbook entry for payment cudos address...');
                    const addressbookEntry = this.cudosChainRepo.fetchAddressbookEntry(paymentEventEntity.cudosAddress);
                    if (addressbookEntry === null) {
                        ContractEventWorker.warn(`\tAddressbook entry not found for payment nft id.\n\t\tNftId: ${nftId}\n\t\tPayment cudos address: ${paymentEventEntity.cudosAddress}`);
                        shouldRefund = true;
                    }

                    // if check fails, unlock payment
                    if (shouldRefund === true) {
                        ContractEventWorker.warn('\tMarking payment for refunding...');
                        const txhash = await this.contractRepo.markPaymentWithdrawable(nftId);
                        ContractEventWorker.warn(`\tNftId ${nftId} marked as refunded. TxHash: ${txhash}`);

                        // if the checks pass, send payment to on demand minting service
                    } else {
                        ContractEventWorker.log('Sending on demand minting Tx...')
                        const txhash = await this.cudosChainRepo.sendOnDemandMintingTx(paymentEventEntity, nftEntity);
                        ContractEventWorker.log(`\tNftId ${nftId} sent for mint to on demand minting service. TxHash: ${txhash}`);
                    }
                }

            } else {
                ContractEventWorker.log('No events found until curren block. Block number: ', currentEthereumBlock);
            }

            // save last checked block
            ContractEventWorker.log('Saving last checked Ethereum block: ', currentEthereumBlock);
            this.cudosAuraPoolServiceApi.updateLastCheckedEthereumBlock(lastCheckedBlock);
            ContractEventWorker.log('Run finished.');
        } catch (e) {
            console.error(e.message);
        }
    }

    static log(...msg) {
        ContractEventWorker.log(`${ContractEventWorker.WORKER_NAME}: ${msg}`);
    }

    static warn(...msg) {
        console.warn(`${ContractEventWorker.WORKER_NAME}: ${msg}`);
    }

    static error(...msg) {
        console.error(`${ContractEventWorker.WORKER_NAME}: ${msg}`);
    }
}
