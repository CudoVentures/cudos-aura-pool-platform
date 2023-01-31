import { SearchByTagsQuery } from '@cosmjs/stargate/build/search';

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
