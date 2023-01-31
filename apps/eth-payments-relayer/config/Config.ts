import * as cfg from 'dotenv';

const env = {};
cfg.config({ path: './config/.env' });

export default {
    LOOP_INTERVAL_MILIS: 1000,
    AURA_POOL_API: `${process.env.App_Host}:${process.env.App_Port}`,
    RPC_ENDPOINT: process.env.APP_CUDOS_RPC,
    ETH_CHAIN_ID: process.env.APP_ETH_CHAIN_ID,
    AURA_POOL_CONTRACT_ADDRESS: process.env.APP_AURA_POOL_CONTRACT_ADDRESS,
    ETH_NODE_URL: process.env.App_Eth_Node_Url,
    CONTRACT_ADMIN_RPIVATE_KEY: process.env.App_Contract_Admin_Private_Key,
};
