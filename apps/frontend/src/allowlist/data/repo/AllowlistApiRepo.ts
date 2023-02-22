import AllowlistUserEntity from '../../entities/AllowlistUserEntity';
import AllowlistRepo from '../../presentation/repos/AllowlistRepo';
import AllowlistApi from '../data-sources/AllowlistApi';

export default class AllowlistApiRepo implements AllowlistRepo {
    allowlistApi: AllowlistApi;

    constructor() {
        this.allowlistApi = new AllowlistApi();
    }

    async fetchTotalListedUsers(): Promise < number > {
        try {
            return this.allowlistApi.fetchTotalListedUsers();
        } catch (e) {
            console.log(e);
            return 0;
        }
    }

    async fetchAllowlistUserBySessionAccount(): Promise < AllowlistUserEntity > {
        try {
            return this.allowlistApi.fetchAllowlistUserBySessionAccount();
        } catch (e) {
            console.log(e);
            return null;
        }
    }

}
