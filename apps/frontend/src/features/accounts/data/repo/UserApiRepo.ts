import UserRepo from '../../presentation/repos/UserRepo';
import UserApi from '../data-sources/userApi';

export default class UserApiRepo implements UserRepo {
    userApi: UserApi;

    constructor() {
        this.userApi = new UserApi();
    }
    async fetchUserEarningsStatistics(walletAddress: string, timestamp: number): Promise < number[] > {
        return this.userApi.fetchUserEarningsStatistics(walletAddress, timestamp);
    }

}
