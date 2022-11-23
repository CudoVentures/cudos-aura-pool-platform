export default interface CudosAuraPoolServiceRepo {

    fetchHeartbeat(): Promise< void >;
    fetchLastCheckedBlock(): Promise < number >;
    triggerUpdateCollections(denomIds: string[]): Promise < void >;
    triggerUpdateNfts(tokenIds: string[]): Promise < void >;
    updateLastCheckedheight(height: number): Promise < void >;
}
