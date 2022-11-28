export enum NftStatus {
    QUEUED = 'queued',
    MINTED = 'minted',
    REMOVED = 'removed',
}

export type MarketplaceNftFilters = {
    denom_ids: string[];
    tx_hash: string;
};
