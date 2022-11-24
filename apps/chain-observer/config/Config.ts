import * as cfg from 'dotenv';

const env = {};
cfg.config({ path: './config/.env' });

export default {
    CHAIN_TYPE: process.env.APP_DEFAULT_NETWORK,
    AURA_POOL_API: `${process.env.App_Host}:${process.env.App_Port}`,
    RPC_ENDPOINT: {
        LOCAL: process.env.APP_LOCAL_RPC,
        PRIVATE: process.env.APP_PRIVATE_RPC,
        PUBLIC: process.env.APP_PUBLIC_RPC,
    },
    BLOCK_CHECK_LIMIT: 10000,
    LOOP_INTERVAL_MILIS: 7000,
};
