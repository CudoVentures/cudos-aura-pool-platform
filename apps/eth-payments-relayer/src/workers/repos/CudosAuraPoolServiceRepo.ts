import NftEntity from '../../entities/NftEntity';

export default interface CudosAuraPoolServiceRepo {

    fetchHeartbeat(): Promise< void >;
    fetchLastCheckedEthereumBlock(): Promise < number >;
    updateLastCheckedEthereumBlock(height: number): Promise < void >;

    fetchNftsMapByIds(nftIds: string[]): Promise < Map< string, NftEntity > >;
}
