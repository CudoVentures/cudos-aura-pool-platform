import Config from '../config/Config';
import { StargateClient } from 'cudosjs';
import CudosAuraPoolServiceApi from './data/CudosAuraPoolServiceApi';
import TxFindWorker from './workers/TxFindWorker';

export default class App {
    p: NodeJS.Timeout;
    running: boolean;

    async start() {
        this.running = true;

        console.log('Getting a chain client connection...');
        const client = await this.getChainClient();
        console.log('Connection to chain client established.');

        console.log('Testing AuraPoolService connection...');
        const api = await this.getAuraPoolServiceApi();
        console.log('Connection to AuraPoolService established.');

        const worker = new TxFindWorker(client, api);

        this.p = setInterval(async () => {
            try {
                await worker.run();
            } catch (e) {
                console.log(e);
            }
        }, Config.LOOP_INTERVAL_MILIS);
    }

    stop() {
        this.running = false;

        clearInterval(this.p);
    }

    async getChainClient() {
        while (this.running) {
            try {
                return await StargateClient.connect(Config.RPC_ENDPOINT)
            } catch (e) {
                console.log('Failed to get a chain client. Retrying...');
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
