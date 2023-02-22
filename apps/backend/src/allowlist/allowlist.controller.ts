import { Controller, Get, HttpCode, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestWithSessionAccounts } from '../common/commont.types';

import AllowlistService from './allowlist.service';
import { ConfigService } from '@nestjs/config';
import { ResFetchAllowlist, ResFetchAllowlistUserBySessionAccount } from './dto/responses.dto';

@ApiTags('Allowlist')
@Controller('allowlist')
export class AllowlistController {
    allowlistId: string;

    constructor(
        private allowlistService: AllowlistService,
        private configService: ConfigService,
    ) {
        this.allowlistId = this.configService.getOrThrow<string>('App_Presale_Allowlist_Id');
    }

    @Get()
    @HttpCode(200)
    async fetchAllowlist(): Promise < ResFetchAllowlist > {
        const allowlistEntity = await this.allowlistService.getAllowlistById(this.allowlistId);
        return new ResFetchAllowlist(allowlistEntity);
    }

    @ApiBearerAuth('access-token')
    @Get('fetchAllowlistUserBySessionAccount')
    @HttpCode(200)
    async fetchAllowlistUserBySessionAccount(@Req() req: RequestWithSessionAccounts): Promise < ResFetchAllowlistUserBySessionAccount > {
        if (req.sessionUserEntity === null) {
            return new ResFetchAllowlistUserBySessionAccount(null);
        }

        const allowlistUserEntity = await this.allowlistService.getAllowlistUserByAddress(req.sessionUserEntity.cudosWalletAddress);
        return new ResFetchAllowlistUserBySessionAccount(allowlistUserEntity);
    }
}
