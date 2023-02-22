import axios from '../../../core/utilities/AxiosWrapper';
import AllowlistUserEntity from '../../entities/AllowlistUserEntity';
import { ResFetchTotalListedUsers, ResFetchAllowlistUserBySessionAccount } from '../dto/Responses';

export default class AllowlistApi {
    static allowlistEndpoints = '/api/v1/allowlist';

    async fetchTotalListedUsers(): Promise < number > {
        const { data } = await axios.get(`${AllowlistApi.allowlistEndpoints}`);

        const res = new ResFetchTotalListedUsers(data);

        const allowlistEntity = res.allowlistEntity

        if (allowlistEntity === null) {
            throw Error('Allowlist not found.');
        }

        return allowlistEntity.users?.length ?? 0;
    }

    async fetchAllowlistUserBySessionAccount(): Promise < AllowlistUserEntity > {
        const { data } = await axios.get(`${AllowlistApi.allowlistEndpoints}/fetchAllowlistUserBySessionAccount`);

        const res = new ResFetchAllowlistUserBySessionAccount(data);

        return res.allowlistUserEntity;
    }
}
