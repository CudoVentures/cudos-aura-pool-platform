export default interface CudosAuraPoolServiceRepo {

    fetchHeartbeat(): Promise< void >;
    fetchLastCheckedBlock(): Promise < number >;
    updateLastCheckedheight(height: number): Promise < void >;
    triggerUpdateMarketplaceModuleCollections(denomIds: string[]): Promise < void >;
    triggerUpdateMarketplaceModuleNfts(nftDtos: {tokenId: string, denomId: string}[]): Promise < void >;
    triggerUpdateNftModuleCollections(denomIds: string[]): Promise < void >;
    triggerUpdateNftModuleNfts(tokenIds: string[]): Promise < void >;
}
