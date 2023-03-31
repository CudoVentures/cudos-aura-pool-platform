import { Controller, Get, HttpCode, Req, UseInterceptors } from '@nestjs/common';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';

import AllowlistService from './allowlist.service';
import { ResFetchAllowlist, ResFetchAllowlistUserBySessionAccount } from './dto/responses.dto';

@Controller('allowlist')
export class AllowlistController {

    constructor(
        private allowlistService: AllowlistService,
    ) {}

    @Get()
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async fetchAllowlist(
        @Req() req: AppRequest,
    ): Promise < ResFetchAllowlist > {
        const allowlistEntity = await this.allowlistService.getAllowlist(req.transaction);
        return new ResFetchAllowlist(allowlistEntity);
    }

    @Get('fetchAllowlistUserBySessionAccount')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async fetchAllowlistUserBySessionAccount(
        @Req() req: AppRequest,
    ): Promise < ResFetchAllowlistUserBySessionAccount > {
        if (req.sessionUserEntity === null) {
            return new ResFetchAllowlistUserBySessionAccount(null);
        }

        const allowlistUserEntity = await this.allowlistService.getAllowlistUserByAddress(req.sessionUserEntity.cudosWalletAddress, req.transaction);
        return new ResFetchAllowlistUserBySessionAccount(allowlistUserEntity);
    }
}
