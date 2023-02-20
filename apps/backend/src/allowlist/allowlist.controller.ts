import { Body, Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestWithSessionAccounts } from '../common/commont.types';

import AllowlistService from './allowlist.service';
import { ConfigService } from '@nestjs/config';
import { ResFetchAllowlistEntity, ResFetchAllowlistUser } from './dto/responses.dto';

@ApiTags('Allowlist')
@Controller('allowlist')
export class NFTController {
    constructor(
        private allowlistService: AllowlistService,
        private configService: ConfigService,
    // eslint-disable-next-line no-empty-function
    ) {}

    @Get(':id')
    @HttpCode(200)
    async fetchAllowlist(
        @Param('id') id: string,
    ): Promise<ResFetchAllowlistEntity> {
        const allowlistEntity = await this.allowlistService.getAllowlistById(id);

        return new ResFetchAllowlistEntity(allowlistEntity);
    }

    @ApiBearerAuth('access-token')
    @Get('user')
    @HttpCode(200)
    async fetchAllowlistUser(@Body() req: RequestWithSessionAccounts): Promise<ResFetchAllowlistUser> {
        const allowlistUserEntity = await this.allowlistService.getAllowlistUserByAddress(
            req.sessionUserEntity?.cudosWalletAddress,
        );

        return new ResFetchAllowlistUser(allowlistUserEntity);
    }
}
