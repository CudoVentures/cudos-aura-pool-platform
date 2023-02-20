import axios from '../../../core/utilities/AxiosWrapper';
import { PRESALE_CONSTS } from '../../../core/utilities/Constants';
import AllowlistEntity from '../../entities/AllowlistEntity';
import AllowlistUserEntity from '../../entities/AllowlistUserEntity';
import { ResFetchAllowlistEntity, ResFetchAllowlistUser } from '../dto/Responses';

export default class AllowlistApi {
    static allowlistEndpoints = '/api/v1/allowlist';

    async getAllowlistUserByAddress(address: string): Promise < AllowlistUserEntity > {
        const resultJson = await axios.get(`${AllowlistApi.allowlistEndpoints}/user/${address}`);

        const res = new ResFetchAllowlistUser(resultJson.data);

        return res.allowlistUserEntity;
    }

    async fetchTotalListedUsers(allowlistId: string): Promise < number > {
        const resultJson = await axios.get(`${AllowlistApi.allowlistEndpoints}/${allowlistId}`);

        const res = new ResFetchAllowlistEntity(resultJson.data);

        const allowlistEntity = res.allowlistEntity

        if (allowlistEntity === null) {
            throw Error('Allowlist not found.');
        }

        return allowlistEntity.users.length
    }
}
