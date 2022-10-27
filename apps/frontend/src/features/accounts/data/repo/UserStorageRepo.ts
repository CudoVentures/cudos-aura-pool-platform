import UserRepo from '../../presentation/repos/UserRepo';

export default class UserStorageRepo implements UserRepo {

    async fetchUserEarningsStatistics(walletAddress: string, timestamp: number): Promise < number[] > {
        return [100, 232, 24, 51, 46, 43, 234, 534, 34, 56, 34, 53, 235, 532, 2, 353, 323, 100, 232, 24, 51, 46, 43, 234, 534, 34, 56, 34, 53, 235, 532, 2, 353, 323];
    }

}
