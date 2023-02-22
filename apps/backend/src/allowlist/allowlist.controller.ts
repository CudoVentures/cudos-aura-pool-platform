import { Body, Controller, Get, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestWithSessionAccounts } from '../common/commont.types';

import AllowlistService from './allowlist.service';
import { ConfigService } from '@nestjs/config';
import { ResFetchAllowlist, ResFetchAllowlistUserBySessionAccount } from './dto/responses.dto';

@ApiTags('Allowlist')
@Controller('allowlist')
export class NFTController {
    allowlistId: string;

    constructor(
        private allowlistService: AllowlistService,
        private configService: ConfigService,
    ) {
        this.allowlistId = this.configService.getOrThrow<string>('App_Presale_Allowlist_Id');
    }

    @HttpCode(200)
    async fetchAllowlist(): Promise<ResFetchAllowlist> {
        const allowlistEntity = await this.allowlistService.getAllowlistById(this.allowlistId);
        return new ResFetchAllowlist(allowlistEntity);
    }

    @ApiBearerAuth('access-token')
    @Get('fetchAllowlistUserBySessionAccount')
    @HttpCode(200)
    async fetchAllowlistUserBySessionAccount(@Body() req: RequestWithSessionAccounts): Promise<ResFetchAllowlistUserBySessionAccount> {
        const allowlistUserEntity = await this.allowlistService.getAllowlistUserByAddress(req.sessionUserEntity.cudosWalletAddress);
        return new ResFetchAllowlistUserBySessionAccount(allowlistUserEntity);
    }
}
