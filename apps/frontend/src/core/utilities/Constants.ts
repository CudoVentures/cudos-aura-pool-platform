// CONFIGURATIONS
declare let Config;

// const requiredEnvs = [
//     'APP_DEFAULT_NETWORK',
//     'APP_GAS_PRICE',
//     'APP_CUDOS_RPC',
//     'APP_CUDOS_API',
//     'APP_CUDOS_STAKING_URL',
//     'APP_CUDOS_EXPLORER_URL',
//     'APP_CUDOS_CHAIN_NAME',
//     'APP_CUDOS_CHAIN_ID',
//     'APP_CUDOS_ON_DEMAND_MINTING_ADDRESS',
// ]

export const SIGN_NONCE = -74563;

export const ADDRESSBOOK_LABEL = 'aurapool';
export const ADDRESSBOOK_NETWORK = 'aurapool';

export const CHAIN_DETAILS = {
    ADMIN_TOKEN_DENOM: 'cudosAdmin',
    NATIVE_TOKEN_DENOM: 'acudos',
    CURRENCY_DISPLAY_NAME: 'CUDOS',
    DEFAULT_NETWORK: Config.APP_DEFAULT_NETWORK ?? '',
    GAS_PRICE: Config.APP_CUDOS_GAS_PRICE ?? '',
    RPC_ADDRESS: Config.APP_CUDOS_RPC ?? '',
    API_ADDRESS: Config.APP_CUDOS_API ?? '',
    STAKING_URL: Config.APP_CUDOS_STAKING_URL ?? '',
    EXPLORER_URL: Config.APP_CUDOS_EXPLORER_URL ?? '',
    CHAIN_NAME: Config.APP_CUDOS_CHAIN_NAME ?? '',
    CHAIN_ID: Config.APP_CUDOS_CHAIN_ID ?? '',
    MINTING_SERVICE_ADDRESS: Config.APP_CUDOS_ON_DEMAND_MINTING_ADDRESS ?? '',
}
