import * as cfg from 'dotenv';

cfg.config({ path: './config/.env' });

export default {
    ENV_DEV: process.env.APP_ENV === 'dev',
    ENV_PRODUCTION: process.env.APP_ENV === 'production',
    APP_SENDGRID_API_KEY: process.env.App_Sendgrid_Api_Key,
    CUDOS_MARKETS_API: `${process.env.App_Host}:${process.env.App_Port}`,
    RPC_ENDPOINT: process.env.APP_CUDOS_RPC,
    BLOCK_CHECK_LIMIT: 100,
    LOOP_INTERVAL_MILIS: 7000,
    APP_SERVICE_EMAIL: process.env.App_Service_Email,
    APP_EMAIL_FROM: process.env.App_Email_From,
    APP_CUDOS_MARKETS_API_KEY: process.env.App_Cudos_Markets_Api_Key,
    APP_CUDOS_ON_DEMAND_MINTING_ADDRESS: process.env.APP_CUDOS_ON_DEMAND_MINTING_ADDRESS,
};
