import Config from '../../config/Config';

export type HeightFilter = {
    minHeight: number;
    maxHeight: number;
}

export const MarketplaceCollectionEventTypes: string[] = [
    'publish_collection',
    'verify_collection',
    'unverify_collection',
    'create_collection',
    'update_royalties',
]

export const MarketplaceNftEventTypes: string[] = [
    'publish_nft',
    'buy_nft',
    'marketplace_mint_nft',
    'remove_nft',
    'update_price',
]

export const NftModuleCollectionEventTypes: string[] = [
    'issue_denom',
    'transfer_denom',
]

export const NftModuleNftEventTypes: string[] = [
    'transfer_nft',
    'approve_nft',
    'approve_all_nft',
    'revoke_nft',
    'edit_nft',
    'mint_nft',
    'burn_nft',
]

export function makeHeightSearchQuery(query: ReadonlyArray <{readonly key: string, readonly value: string}>, heightFilter: HeightFilter): string {
    return `${query.map((t) => `${t.key}='${t.value}'`).join(' AND ')} AND tx.height >= ${heightFilter.minHeight} AND tx.height <= ${heightFilter.maxHeight}`;
}

export const MarketplaceModuleFilter = [
    {
        key: 'message.module',
        value: 'marketplace',
    },
];

export const NftModuleFilter = [
    {
        key: 'message.module',
        value: 'nft',
    },
];

export const AddressbookModuleFilter = [
    {
        key: 'message.module',
        value: 'addressbook',
    },
];

export const OnDemandMintReceivedFundsFilter = [
    {
        key: 'message.module',
        value: 'bank',
    },
    {
        key: 'transfer.recipient',
        value: Config.APP_CUDOS_ON_DEMAND_MINTING_ADDRESS,
    },
];

export const OnDemandMintNftMintFilter = [
    {
        key: 'message.module',
        value: 'marketplace',
    },
    {
        key: 'message.action',
        value: 'mint_nft',
    },
    {
        key: 'message.sender',
        value: Config.APP_CUDOS_ON_DEMAND_MINTING_ADDRESS,
    },
];

export const OnDemandMintRefundsFilter = [
    {
        key: 'message.module',
        value: 'bank',
    },
    {
        key: 'transfer.sender',
        value: Config.APP_CUDOS_ON_DEMAND_MINTING_ADDRESS,
    },
];
