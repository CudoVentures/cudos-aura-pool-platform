import { HttpService } from '@nestjs/axios';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transaction } from 'sequelize';
import AllowlistUser from './entities/allowlist-user.entity';
import AllowlistEntity from './entities/allowlist.entity';

@Injectable()
export default class AllowlistService {
    static allowlistEndpoints = '/api/v1/allowlist';
    allowlistUrl: string;
    allowlistId: string;
    allowlistApiKey: string;

    constructor(
        @Inject(forwardRef(() => ConfigService))
        private configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.allowlistUrl = this.configService.getOrThrow < string >('APP_ALLOWLIST_URL');
        this.allowlistId = this.configService.getOrThrow<string>('APP_PRESALE_ALLOWLIST_ID');
        this.allowlistApiKey = this.configService.getOrThrow<string>('APP_ALLOWLIST_API_KEY');
    }

    // controller functions
    async getAllowlist(dbTx: Transaction): Promise < AllowlistEntity > {
        const { data } = await this.httpService.axiosRef.get(`${this.allowlistUrl}${AllowlistService.allowlistEndpoints}/id/${this.allowlistId}`, this.getAllowlistRequestHeaders());
        return AllowlistEntity.fromJson(data.allowlistEntity);
    }

    async getAllowlistUserByAddress(address: string, dbTx: Transaction): Promise < AllowlistUser > {
        const { data } = await this.httpService.axiosRef.get(`${this.allowlistUrl}${AllowlistService.allowlistEndpoints}/${this.allowlistId}/user/address/${address}`, this.getAllowlistRequestHeaders());
        return AllowlistUser.fromJson(data.userEntity);
    }

    private getAllowlistRequestHeaders() {
        return {
            headers: {
                'x-api-key': this.allowlistApiKey,
            },
        }
    }
}
