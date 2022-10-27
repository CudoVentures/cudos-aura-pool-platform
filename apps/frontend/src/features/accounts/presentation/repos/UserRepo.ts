export default interface UserRepo {
    fetchUserEarningsStatistics(walletAddress: string, timestamp: number): Promise < number[] >;
}
