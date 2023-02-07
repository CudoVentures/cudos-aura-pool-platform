import { DirectSecp256k1HdWallet } from 'cudosjs';
import * as cfg from 'dotenv';
import { env } from 'process';

cfg.config({ path: './config/.env' });

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
    CUDOS_SIGNER_ADDRESS: '',
    EXPECTED_PRICE_ETH: process.env.APP_PRESALE_NFT_ETH_PRICE,
    EXPECTED_PRICE_CUDOS: process.env.APP_PRESALE_NFT_CUDOS_PRICE,
};

export default config;

export async function initConfig() {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(process.env.App_Eth_Payment_Relayer_Cudos_Wallet_Mnemonic);
    const accounts = await wallet.getAccounts();
    const address = accounts[0].address;

    config.CUDOS_SIGNER_ADDRESS = address;
}
