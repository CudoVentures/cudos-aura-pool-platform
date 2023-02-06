import { Body, Controller, Get, HttpCode, Post, Put, Req, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountType } from '../account/account.types';
import RoleGuard from '../auth/guards/role.guard';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { ReqCreditSettings, ReqUpdateLastCheckedBlockRequest, ReqUpdateLastCheckedPaymentRelayerBlocksRequest } from './dto/requests.dto';
import { ResCreditSettings, ResFetchLastCheckedPaymenrRelayerBlocks, ResFetchSettings } from './dto/responses.dto';
import SettingsEntity from './entities/settings.entity';
import GeneralService from './general.service';

@ApiTags('GENERAL')
@Controller('general')
export class GeneralController {
    constructor(private generalService: GeneralService) {}

    @Get('heartbeat')
    @HttpCode(200)
    async getAlive(): Promise<string> {
        return 'running';
    }

    @Get('last-checked-block')
    @HttpCode(200)
    async getLastCheckedBlock(): Promise<{height: number}> {
        const height = await this.generalService.getLastCheckedBlock();
        return { height: height === 0 ? parseInt(process.env.APP_CUDOS_INIT_BLOCK) : height };
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('last-checked-block')
    @HttpCode(200)
    async updateLastCheckedBlock(
        @Req() req: AppRequest,
        @Body() reqUpdateLastCheckedBlockRequest: ReqUpdateLastCheckedBlockRequest,
    ): Promise<any> {
        return this.generalService.setLastCheckedBlock(reqUpdateLastCheckedBlockRequest.height);
    }

    @Get('last-checked-payment-relayer-blocks')
    @HttpCode(200)
    async getLastCheckedPaymentRelayerBlock(): Promise<ResFetchLastCheckedPaymenrRelayerBlocks> {
        const { lastCheckedEthBlock, lastCheckedCudosBlock } = await this.generalService.getLastCheckedPaymentRelayerBlocks();

        const res = new ResFetchLastCheckedPaymenrRelayerBlocks(lastCheckedEthBlock, lastCheckedCudosBlock);

        return res;
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('last-checked-payment-relayer-blocks')
    @HttpCode(200)
    async updateLastCheckedPaymentRelayerBlock(
        @Req() req: AppRequest,
        @Body() reqUpdateLastCheckedBlockRequest: ReqUpdateLastCheckedPaymentRelayerBlocksRequest,
    ): Promise<any> {
        return this.generalService.setLastCheckedPaymentRelayerBlocks(reqUpdateLastCheckedBlockRequest.lastCheckedEthBlock, reqUpdateLastCheckedBlockRequest.lastCheckedCudosBlock);
    }

    @Get('fetchSettings')
    @HttpCode(200)
    async fetchSettings(): Promise < ResFetchSettings > {
        const settingsEntity = await this.generalService.fetchSettings();
        return new ResFetchSettings(settingsEntity);
    }

    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
    @UseInterceptors(TransactionInterceptor)
    @Post('creditSettings')
    @HttpCode(200)
    async creditSettings(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqCreditSettings: ReqCreditSettings,
    ): Promise < ResCreditSettings > {
        let settingsEntity = SettingsEntity.fromJson(reqCreditSettings.settingsEntity);
        if (settingsEntity.hasValidRoyaltiesPrecision() === false) {
            throw new Error('Max 2 decimal numbers');
        }

        settingsEntity = await this.generalService.creditSettings(settingsEntity, req.transaction);
        return new ResCreditSettings(settingsEntity);
    }
}
