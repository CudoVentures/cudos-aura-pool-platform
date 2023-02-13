import Config, { initConfig } from '../config/Config';
import { DirectSecp256k1HdWallet, GasPrice, SigningStargateClient, StargateClient } from 'cudosjs';
import CudosAuraPoolServiceApi from './data/CudosAuraPoolServiceApiRepo';
import { ethers } from 'ethers';
import AuraPoolContract from '../contracts/CudosAuraPool.sol/CudosAuraPool.json'
import CudosChainRpcRepo from './data/CudosChainRpcRepo';
import ContractEventWorker from './workers/ContractEventWorker';
import AuraContractRpcRepo from './data/AuraContractRpcRepo';
import CudosRefundWorker from './workers/CudosRefundWorker';
import Logger from '../config/Logger';

export default class App {
    // eslint-disable-next-line no-undef
    p: NodeJS.Timeout;
    running: boolean;

    async start() {
        this.running = true;

        await initConfig();

        Logger.info('Getting a chain client connection...');
        const { stargateClient, signingStargateClient } = await this.getCudosChainClient();
        const chainApiRepo = new CudosChainRpcRepo(stargateClient, signingStargateClient);
        Logger.info('Connection to chain client established.');

        Logger.info('Getting an ETH contract connection...');
        const contract = await this.getEthContract();
        const contractRpcRepo = new AuraContractRpcRepo(contract);
        Logger.info('Connection to ETH contract established.');

        Logger.info('Testing AuraPoolService connection...');
        const api = await this.getAuraPoolServiceApi();
        Logger.info('Connection to AuraPoolService established.');

        const contractEventWorker = new ContractEventWorker(chainApiRepo, contractRpcRepo, api);
        const cudosRefundWorker = new CudosRefundWorker(chainApiRepo, contractRpcRepo, api);

        const run = async () => {
            Logger.info('New run...');

            await contractEventWorker.run();
            await cudosRefundWorker.run();

            console.log('-------------------------------------------------------------------------------');

            loop();
        }

        const loop = () => {
            if (this.running === true) {
                this.p = setTimeout(run, Config.LOOP_INTERVAL_MILIS);
            }
        }

        loop();
    }

    stop() {
        this.running = false;
        clearTimeout(this.p);
    }

    async getCudosChainClient() {
        while (this.running) {
            try {
                const stargateClient = await StargateClient.connect(Config.RPC_ENDPOINT);
                const wallet = await DirectSecp256k1HdWallet.fromMnemonic(Config.CUDOS_SIGNER_MNEMONIC);
                const signingStargateClient = await SigningStargateClient.connectWithSigner(Config.RPC_ENDPOINT, wallet, {
                    gasPrice: GasPrice.fromString(`${Config.CUDOS_GAS_PRICE}acudos`),
                });

                // it will fail if account not exists
                const signerBalance = await signingStargateClient.getBalance(Config.CUDOS_SIGNER_ADDRESS, 'acudos');
                Logger.info(`SIGNER BALANCE: ${signerBalance.amount} acudos`)
                return { stargateClient, signingStargateClient }

            } catch (e) {
                Logger.error(e)
                Logger.error(`Failed to get a chain client using ${Config.RPC_ENDPOINT}. Retrying...`);
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
                Logger.error(`Failed to get a chain client using ${Config.RPC_ENDPOINT}. Retrying...`);
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
                Logger.error('Failed to get a heartbeat from AuraPoolService. Retrying...');
                await new Promise((resolve) => { setTimeout(resolve, 2000) });
            }
        }

        return null;
    }
}
