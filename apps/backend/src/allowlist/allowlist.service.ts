import { Injectable } from '@nestjs/common';
import axios from 'axios';
import AllowlistUser from './entities/allowlist-user.entity';

@Injectable()
export default class AllowlistService {
    static allowlistEndpoints = '/api/v1/allowlist';

    async getAllowlistUserByAddress(allowlistId: string, address: string): Promise < AllowlistUser > {
        const resultJson = await axios.get(`${AllowlistService.allowlistEndpoints}/${allowlistId}/user/${address}`);

        return AllowlistUser.fromJson(resultJson);
    }
}
