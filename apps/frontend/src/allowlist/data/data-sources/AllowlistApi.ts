import axios from '../../../core/utilities/AxiosWrapper';
import AllowlistEntity from '../../entities/AllowlistEntity';
import AllowlistUserEntity from '../../entities/AllowlistUserEntity';

export default class AllowlistApi {
    static allowlistEndpoints = '/api/v1/allowlist';

    async getAllowlistUserByAddress(allowlistId: string, address: string): Promise < AllowlistUserEntity > {
        // const resultJson = await axios.get(`${AllowlistApi.allowlistEndpoints}/${allowlistId}/user/${address}`);

        // return AllowlistUserEntity.fromJson(resultJson);

        return new AllowlistUserEntity();
    }

    async fetchTotalListedUsers(allowlistId: string): Promise < number > {
        // const resultJson = await axios.get(`${AllowlistApi.allowlistEndpoints}/${allowlistId}`);
        // const allowlistEntity = AllowlistEntity.fromJson(resultJson);

        // return allowlistEntity.addresses.length

        return 5000;
    }
}
