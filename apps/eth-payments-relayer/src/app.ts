import Config from '../config/Config';
import { StargateClient } from 'cudosjs';
import CudosAuraPoolServiceApi from './data/CudosAuraPoolServiceApi';
import TxFindWorker from './workers/ContractEventWorker';
import { ethers } from 'ethers';
import AuraPoolContract from '../../..'

export default class App {
    p: NodeJS.Timeout;
    running: boolean;

    async start() {
        this.running = true;

        console.log('Getting a chain client connection...');
        const cudosClient = await this.getCudosChainClient();
        console.log('Connection to chain client established.');

        console.log('Getting a ETH contract connection...');
        const contract = await this.getEthContract();
        console.log('Connection to ETH contract established.');

        console.log('Testing AuraPoolService connection...');
        const api = await this.getAuraPoolServiceApi();
        console.log('Connection to AuraPoolService established.');

        const contractEventWorker = new ContractEventWorker(cudosClient, contract, api);
        const cudosRefundWorker = new CudosRefuntdWorker(cudosClient, contract, api);

        this.p = setInterval(async () => {
            console.log('New run...');

            await contractEventWorker.run();
            await cudosRefundWorker.run();

            console.log('-----------------------------');
        }, Config.LOOP_INTERVAL_MILIS);
    }

    stop() {
        this.running = false;

        clearInterval(this.p);
    }

    async getCudosChainClient() {
        while (this.running) {
            try {
                return await StargateClient.connect(Config.RPC_ENDPOINT)
            } catch (e) {
                console.log(`Failed to get a chain client using ${Config.RPC_ENDPOINT}. Retrying...`);
                await new Promise((resolve) => { setTimeout(resolve, 2000) });
            }
        }

        return null;
    }

    async getEthContract() {
        while (this.running) {
            try {
                const provider = new ethers.providers.JsonRpcProvider(Config.ETH_NODE_URL);
                const wallet = new ethers.Wallet(Config.CONTRACT_ADMIN_RPIVATE_KEY || '', provider);
                const contract = ethers.ContractFactory.getContract(Config.AURA_POOL_CONTRACT_ADDRESS || '', AuraPoolContract.abi, wallet);
                return await contract.deployed();
            } catch (e) {
                console.log(`Failed to get a chain client using ${Config.RPC_ENDPOINT}. Retrying...`);
                await new Promise((resolve) => { setTimeout(resolve, 2000) });
            }
        }

        return null;
    }

    async getAuraPoolServiceApi() {
        while (this.running) {
            try {
                const cudosAuraPoolApi = new CudosAuraPoolServiceApi();

                await cudosAuraPoolApi.fetchHeartbeat();

                return cudosAuraPoolApi;
            } catch (e) {
                console.log('Failed to get a heartbeat from AuraPoolService. Retrying...');
                await new Promise((resolve) => { setTimeout(resolve, 2000) });
            }
        }

        return null;
    }
}
