export enum CollectionStatus {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    DELETED = 'deleted',
}

export type MarketplaceCollectionFilters = {
    denom_id: string;
};
