import { StargateClient } from '@cosmjs/stargate';
import Config from '../../config/Config';
import ethers from 'ethers';

import CudosAuraPoolServiceRepo from './repos/CudosAuraPoolServiceRepo';

// TODO:
export default class CudosRefundWorker {
    chainClient: StargateClient;
    contract: ethers.Contract;
    cudosAuraPoolServiceApi: CudosAuraPoolServiceRepo;

    constructor(chainClient: StargateClient, cudosAuraPoolServiceApi: CudosAuraPoolServiceRepo) {
        this.chainClient = chainClient;
        this.cudosAuraPoolServiceApi = cudosAuraPoolServiceApi;
    }

    async run() {
        try {
            console.log('TODOOOOOOOO');

            // get last checked block
            // get all refund transactions from on demand minting address
            // get payment id from memo
            // unlock payment
            // save last checked block
        } catch (e) {
            console.log(e.message);
        }
    }
}
