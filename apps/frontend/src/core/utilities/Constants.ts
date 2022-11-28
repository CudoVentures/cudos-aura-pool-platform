// CONFIGURATIONS
declare let Config;

export const SIGN_NONCE = -74563;

export const CHAIN_DETAILS = {
    ADMIN_TOKEN_DENOM: 'cudosAdmin',
    NATIVE_TOKEN_DENOM: 'acudos',
    CURRENCY_DISPLAY_NAME: 'CUDOS',
    DEFAULT_NETWORK: Config.APP_DEFAULT_NETWORK ?? '',
    GAS_PRICE: Config.APP_GAS_PRICE ?? '',
    RPC_ADDRESS: {
        LOCAL: Config.APP_LOCAL_RPC ?? '',
        PRIVATE: Config.APP_PRIVATE_RPC ?? '',
        PUBLIC: Config.APP_PUBLIC_RPC ?? '',
        MAINNET: Config.APP_MAINNET_RPC ?? '',
    },
    API_ADDRESS: {
        LOCAL: Config.APP_LOCAL_API ?? '',
        PRIVATE: Config.APP_PRIVATE_API ?? '',
        PUBLIC: Config.APP_PUBLIC_API ?? '',
        MAINNET: Config.APP_MAINNET_API ?? '',
    },
    STAKING_URL: {
        LOCAL: Config.APP_LOCAL_STAKING_URL ?? '',
        PRIVATE: Config.APP_PRIVATE_STAKING_URL ?? '',
        PUBLIC: Config.APP_PUBLIC_STAKING_URL ?? '',
        MAINNET: Config.APP_MAINNET_STAKING_URL ?? '',
    },
    EXPLORER_URL: {
        LOCAL: Config.APP_LOCAL_EXPLORER_URL ?? '',
        PRIVATE: Config.APP_PRIVATE_EXPLORER_URL ?? '',
        PUBLIC: Config.APP_PUBLIC_EXPLORER_URL ?? '',
        MAINNET: Config.APP_MAINNET_EXPLORER_URL ?? '',
    },
    CHAIN_NAME: {
        LOCAL: Config.APP_LOCAL_CHAIN_NAME ?? '',
        PRIVATE: Config.APP_PRIVATE_CHAIN_NAME ?? '',
        PUBLIC: Config.APP_PUBLIC_CHAIN_NAME ?? '',
        MAINNET: Config.APP_MAINNET_CHAIN_NAME ?? '',
    },
    CHAIN_ID: {
        LOCAL: Config.APP_LOCAL_CHAIN_ID ?? '',
        PRIVATE: Config.APP_PRIVATE_CHAIN_ID ?? '',
        PUBLIC: Config.APP_PUBLIC_CHAIN_ID ?? '',
        MAINNET: Config.APP_MAINNET_CHAIN_ID ?? '',
    },
    MINTING_SERVICE_ADDRESS: {
        LOCAL: Config.APP_LOCAL_MINTING_SERVICE_ADDRESS ?? '',
        PRIVATE: Config.APP_PRIVATE_MINTING_SERVICE_ADDRESS ?? '',
        PUBLIC: Config.APP_PUBLIC_MINTING_SERVICE_ADDRESS ?? '',
        MAINNET: Config.APP_MAINNET_MINTING_SERVICE_ADDRESS ?? '',
    },
    LOCAL: {
        ALIAS_NAME: 'CUDOS Local Testnet',
        SHORT_NAMES: ['local'],
    },
    PRIVATE: {
        ALIAS_NAME: 'CUDOS Private Testnet',
        SHORT_NAMES: ['private'],
    },
    PUBLIC: {
        ALIAS_NAME: 'CUDOS Public Testnet',
        SHORT_NAMES: ['public'],
    },
    MAINNET: {
        ALIAS_NAME: 'CUDOS Main Network',
        SHORT_NAMES: ['mainnet', 'cudos-1'],
    },
}
