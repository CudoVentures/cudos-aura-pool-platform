export enum CollectionStatus {
    QUEUED = 'queued',
    APPROVED = 'approved',
    DELETED = 'deleted',
    ANY = 'any',
}

export type MarketplaceCollectionFilters = {
    denom_id: string;
};
