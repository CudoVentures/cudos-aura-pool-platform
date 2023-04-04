import BigNumber from 'bignumber.js';
import S from '../../../core/utilities/Main';
import { GasPrice, PageRequest, StargateClient, StdSignature } from 'cudosjs';
import { ADDRESSBOOK_LABEL, ADDRESSBOOK_NETWORK, CHAIN_DETAILS } from '../../../core/utilities/Constants';
import { CudosSigningStargateClient } from 'cudosjs/build/stargate/cudos-signingstargateclient';
import CudosDataEntity from '../../entities/CudosDataEntity';
import CudosRepo from '../../presentation/repos/CudosRepo';
import CudosApi from '../data-sources/CudosApi';

const LOCAL_STORAGE_KEY = 'cudos_aura_service_storage_cudos';

export default class CudosApiRepo implements CudosRepo {

    cudosApi: CudosApi;
    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;

    constructor() {
        this.cudosApi = new CudosApi();
        this.enableActions = null;
        this.disableActions = null;
        this.showAlert = null;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void) {
        this.showAlert = showAlert;
    }

    async fetchCudosData(): Promise < CudosDataEntity > {
        let cudosDataEntity = new CudosDataEntity();
        const cudosDataEntityJsonString = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cudosDataEntityJsonString !== null) {
            const cudosDataEntityJson = JSON.parse(cudosDataEntityJsonString);
            if (cudosDataEntityJson.modelVersion === CudosDataEntity.MODEL_VERSION) {
                cudosDataEntity = CudosDataEntity.fromJson(cudosDataEntityJson);
            }
        }

        if (cudosDataEntity.shouldUpdate() === false) {
            return cudosDataEntity;
        }

        try {
            this.disableActions?.();
            cudosDataEntity = await this.cudosApi.fetchCudosData();
            cudosDataEntity.timestampLastUpdate = Date.now();

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(CudosDataEntity.toJson(cudosDataEntity)));
        } finally {
            this.enableActions?.();
        }

        return cudosDataEntity;
    }

    async fetchAcudosBalance(cudosWalletAddress: string): Promise < BigNumber > {
        try {
            this.disableActions?.();
            const client = await StargateClient.connect(CHAIN_DETAILS.RPC_ADDRESS);
            const coin = await client.getBalance(cudosWalletAddress, CHAIN_DETAILS.NATIVE_TOKEN_DENOM);

            return new BigNumber(coin.amount);
        } catch (ex) {
            return new BigNumber(0);
        } finally {
            this.enableActions?.();
        }
    }

    async creditBitcoinPayoutAddress(client: CudosSigningStargateClient, cudosWalletAddress: string, bitcoinAddress: string): Promise < void > {
        try {
            this.disableActions?.();

            const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}${CHAIN_DETAILS.NATIVE_TOKEN_DENOM}`);
            const availableBtcAddress = await this.fetchBitcoinPayoutAddress(cudosWalletAddress);
            if (availableBtcAddress === '') {
                await client.addressbookCreateAddress(cudosWalletAddress, ADDRESSBOOK_NETWORK, ADDRESSBOOK_LABEL, bitcoinAddress, gasPrice);
            } else {
                await client.addressbookUpdateAddress(cudosWalletAddress, ADDRESSBOOK_NETWORK, ADDRESSBOOK_LABEL, bitcoinAddress, gasPrice);
            }
        } finally {
            this.enableActions?.();
        }
    }

    async fetchBitcoinPayoutAddress(cudosAddress: string): Promise < string > {
        try {
            const cudosClient = await StargateClient.connect(CHAIN_DETAILS.RPC_ADDRESS);
            const res = await cudosClient.addressbookModule.getAddress(cudosAddress, ADDRESSBOOK_NETWORK, ADDRESSBOOK_LABEL);

            return res.address.value
        } catch (e) {
            return S.Strings.EMPTY;
        }
    }

    async fetchBitcoinPayoutAddresses(cudosAddresses: string[]): Promise < string[] > {
        try {
            const cudosClient = await StargateClient.connect(CHAIN_DETAILS.RPC_ADDRESS);

            let total = Number.MAX_SAFE_INTEGER;
            const pagination = PageRequest.fromPartial({ offset: 0, limit: 1000, countTotal: true });

            const fetchedAdresses = [];
            while (total > fetchedAdresses.length) {
                const res = await cudosClient.addressbookModule.getAllAddresses(pagination);
                res.address.forEach((address) => fetchedAdresses.push(address));
                total = res.pagination?.total.toNumber()
                pagination.offset = pagination.offset.add(res.address.length);
            }
            const cudosAddressesMap = new Map();
            cudosAddresses.forEach((cudosAddress) => {
                cudosAddressesMap.set(cudosAddress, true);
            });

            const addresses = fetchedAdresses.filter((address) => {
                return cudosAddressesMap.get(address.value) === true
                    && address.network === ADDRESSBOOK_NETWORK
                    && address.label === ADDRESSBOOK_LABEL;
            });

            return addresses.map((address) => address.value);
        } catch (e) {
            return [];
        }
    }
}
