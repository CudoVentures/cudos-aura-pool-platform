import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import AllowlistUser from './entities/allowlist-user.entity';
import AllowlistEntity from './entities/allowlist.entity';

@Injectable()
export default class AllowlistService {
    static allowlistEndpoints = '/api/v1/allowlist';
    allowlistUrl: string;
    allowlistId: string;

    constructor(
        @Inject(forwardRef(() => ConfigService))
        private configService: ConfigService,
    ) {
        this.allowlistUrl = this.configService.getOrThrow < string >('App_Allowlist_Url');
        this.allowlistId = this.configService.getOrThrow<string>('App_Presale_Allowlist_Id');
    }

    async getAllowlistUserByAddress(address: string): Promise < AllowlistUser > {
        const { data } = await axios.get(`${this.allowlistUrl}${AllowlistService.allowlistEndpoints}/${this.allowlistId}/user/address/${address}`);
        return AllowlistUser.fromJson(data.userEntity);
    }

    async getAllowlist(): Promise < AllowlistEntity > {
        const { data } = await axios.get(`${this.allowlistUrl}${AllowlistService.allowlistEndpoints}/id/${this.allowlistId}`);
        return AllowlistEntity.fromJson(data.allowlistEntity);
    }
}
