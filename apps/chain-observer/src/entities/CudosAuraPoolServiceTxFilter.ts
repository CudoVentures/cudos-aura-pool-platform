import { SearchByTagsQuery } from '@cosmjs/stargate/build/search';

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

export const MarketplaceModuleFilter: SearchByTagsQuery = {
    tags: [
        {
            key: 'message.module',
            value: 'marketplace',
        },
    ],
}

export const NftModuleFilter: SearchByTagsQuery = {
    tags: [
        {
            key: 'message.module',
            value: 'nft',
        },
    ],
}

export const AddressbookModuleFilter: SearchByTagsQuery = {
    tags: [
        {
            key: 'message.module',
            value: 'addressbook',
        },
    ],
}
