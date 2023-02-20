import AllowlistUserEntity from '../../entities/AllowlistUserEntity';
import AllowlistRepo from '../../presentation/repos/AllowlistRepo';
import AllowlistApi from '../data-sources/AllowlistApi';

export default class AllowlistApiRepo implements AllowlistRepo {
    allowlistApi: AllowlistApi;

    constructor() {
        this.allowlistApi = new AllowlistApi();
    }

    async fetchAllowlistUserByAddress(address: string): Promise < AllowlistUserEntity > {
        try {
            return this.allowlistApi.getAllowlistUserByAddress(address);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async fetchTotalListedUsers(allowlistId: string): Promise < number > {
        try {
            return this.allowlistApi.fetchTotalListedUsers(allowlistId);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

}
