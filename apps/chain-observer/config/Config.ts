import * as cfg from 'dotenv';

const env = {};
cfg.config({ path: './config/.env' });

export default {
    AURA_POOL_API: `${process.env.App_Host}:${process.env.App_Port}`,
    RPC_ENDPOINT: process.env.APP_CUDOS_RPC,
    BLOCK_CHECK_LIMIT: 10000,
    LOOP_INTERVAL_MILIS: 7000,
};
