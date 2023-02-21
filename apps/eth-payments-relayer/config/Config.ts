import { DirectSecp256k1HdWallet } from 'cudosjs';
import * as cfg from 'dotenv';

cfg.config({ path: './config/.env' });

let CUDOS_SIGNER_ADDRESS = null;

const config = {
    LOOP_INTERVAL_MILIS: 10000,
    AURA_POOL_API: `${process.env.App_Host}:${process.env.App_Port}`,
    RPC_ENDPOINT: process.env.APP_CUDOS_RPC,
    ETH_CHAIN_ID: process.env.APP_ETH_CHAIN_ID,
    AURA_POOL_CONTRACT_ADDRESS: process.env.APP_AURA_POOL_CONTRACT_ADDRESS,
    ETH_NODE_URL: process.env.App_Eth_Node_Url,
    CONTRACT_ADMIN_RPIVATE_KEY: process.env.App_Contract_Admin_Private_Key,
    CUDOS_GAS_PRICE: process.env.APP_CUDOS_GAS_PRICE,
    MINTING_SERVICE_ADDRESS: process.env.APP_CUDOS_ON_DEMAND_MINTING_ADDRESS,
    CUDOS_SIGNER_MNEMONIC: process.env.App_Eth_Payment_Relayer_Cudos_Wallet_Mnemonic,
    EXPECTED_PRICE_USD: Number(process.env.APP_PRESALE_PRICE_USD),
    EXPECTED_PRICE_EPSILON_PERCENT: Number(process.env.APP_PRESALE_EXPECTED_PRICE_EPSILON),
    async getCudosSignerAddress() {
        if (CUDOS_SIGNER_ADDRESS === null) {
            const wallet = await DirectSecp256k1HdWallet.fromMnemonic(config.CUDOS_SIGNER_MNEMONIC);
            const accounts = await wallet.getAccounts();
            CUDOS_SIGNER_ADDRESS = accounts[0].address;
        }

        return CUDOS_SIGNER_ADDRESS;
    },
};

// config.RPC_ENDPOINT = 'http://34.121.218.76:26657';
// config.MINTING_SERVICE_ADDRESS = 'cudos18ehnzje36mn38c3qj6v2qmzjmg7shc9qke65c5'
// config.CUDOS_SIGNER_MNEMONIC = 'route violin frost amount picture fat race minute donate morning dust wrong alert come taxi float bundle slight broom frequent catch like parent couch';

export default config;
