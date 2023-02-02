import NftEntity from '../../entities/NftEntity';

export default interface CudosAuraPoolServiceRepo {

    fetchHeartbeat(): Promise< void >;
    fetchLastCheckedEthereumBlock(): Promise < number >;
    updateLastCheckedEthereumBlock(height: number): Promise < void >;
    updateLastCheckedCudosRefundBlock(height: number): Promise < void >;
    updateNftPrice(id: string): Promise < void >;
    fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number >;

    fetchNftsMapByIds(nftIds: string[]): Promise < Map< string, NftEntity > >;
}
