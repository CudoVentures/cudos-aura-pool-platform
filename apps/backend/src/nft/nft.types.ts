export const enum NftStatus {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
    DELETED = 'deleted',
    MINTED = 'minted',
}

export type MarketplaceNftFilters = {
    denom_ids: string[];
    tx_hash: string;
};
