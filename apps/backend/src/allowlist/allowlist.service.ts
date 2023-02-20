import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import AllowlistUser from './entities/allowlist-user.entity';
import AllowlistEntity from './entities/allowlist.entity';

@Injectable()
export default class AllowlistService {
    static allowlistEndpoints = '/api/v1/allowlist';

    constructor(
        @Inject(forwardRef(() => ConfigService))
        private configService: ConfigService,
    ) {}

    async getAllowlistUserByAddress(address: string): Promise < AllowlistUser > {
        const allowlistId = this.configService.getOrThrow<string>('App_Presale_Aallowlist_Id');

        const resultJson = await axios.get(`${this.configService.getOrThrow < string >('App_Allowlist_Url')}${AllowlistService.allowlistEndpoints}/${allowlistId}/user/address/${address}`);

        return AllowlistUser.fromJson(resultJson.data.allowlistUser);
    }

    async getAllowlistById(allowlistId: string): Promise < AllowlistEntity > {
        const resultJson = await axios.get(`${this.configService.getOrThrow < string >('App_Allowlist_Url')}${AllowlistService.allowlistEndpoints}/id/${allowlistId}`);

        const allowlistEntity = AllowlistEntity.fromJson(resultJson.data.allowlistEntity);

        return allowlistEntity
    }
}
