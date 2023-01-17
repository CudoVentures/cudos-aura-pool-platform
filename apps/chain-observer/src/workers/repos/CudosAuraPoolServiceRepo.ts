export default interface CudosAuraPoolServiceRepo {

    fetchHeartbeat(): Promise< void >;
    fetchLastCheckedBlock(): Promise < number >;
    updateLastCheckedHeight(height: number): Promise < void >;
    triggerUpdateMarketplaceModuleCollections(denomIds: string[], height: number): Promise < void >;
    triggerUpdateMarketplaceModuleNfts(nftDtos: {tokenId: string, denomId: string}[], height: number): Promise < void >;
    triggerUpdateNftModuleCollections(denomIds: string[], height: number): Promise < void >;
    triggerUpdateNftModuleNfts(tokenIds: string[], height: number): Promise < void >;
}
