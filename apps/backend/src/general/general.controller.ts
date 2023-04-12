import { Body, Controller, Get, HttpCode, Post, Put, Req, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AccountType } from '../account/account.types';
import ApiKeyGuard from '../auth/guards/api-key.guard';
import RoleGuard from '../auth/guards/role.guard';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { ReqCreditSettings, ReqUpdateLastCheckedBlockRequest, ReqUpdateLastCheckedPaymentRelayerBlocksRequest } from './dto/requests.dto';
import { ResCreditSettings, ResFetchLastCheckedPaymenrRelayerBlocks, ResFetchSettings } from './dto/responses.dto';
import SettingsEntity from './entities/settings.entity';
import GeneralService from './general.service';
import { ConfigService } from '@nestjs/config';

@Controller('general')
export class GeneralController {
    constructor(
        private generalService: GeneralService,
        private configService: ConfigService,
    ) {}

    @Get('heartbeat')
    @HttpCode(200)
    @UseGuards(ApiKeyGuard)
    @SkipThrottle()
    async getAlive(): Promise<string> {
        return 'running';
    }

    @Get('last-checked-block')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @UseGuards(ApiKeyGuard)
    @SkipThrottle()
    async getLastCheckedBlock(
        @Req() req: AppRequest,
    ): Promise<{height: number}> {
        const height = await this.generalService.getLastCheckedBlock(req.transaction);
        return { height: height === 0 ? parseInt(this.configService.get('APP_CUDOS_INIT_BLOCK')) : height };
    }

    @Put('last-checked-block')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @UseGuards(ApiKeyGuard)
    @SkipThrottle()
    async updateLastCheckedBlock(
        @Req() req: AppRequest,
        @Body() reqUpdateLastCheckedBlockRequest: ReqUpdateLastCheckedBlockRequest,
    ): Promise<any> {
        return this.generalService.setLastCheckedBlock(reqUpdateLastCheckedBlockRequest.height, req.transaction);
    }

    @Get('last-checked-payment-relayer-blocks')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @UseGuards(ApiKeyGuard)
    @SkipThrottle()
    async getLastCheckedPaymentRelayerBlock(
        @Req() req: AppRequest,
    ): Promise<ResFetchLastCheckedPaymenrRelayerBlocks> {
        const generalEntity = await this.generalService.fetchGeneral(req.transaction);
        const res = new ResFetchLastCheckedPaymenrRelayerBlocks(
            generalEntity.lastCheckedPaymentRelayerEthBlock === 1 ? parseInt(this.configService.get('APP_ETH_RELAYER_ETH_BLOCK_START')) : generalEntity.lastCheckedPaymentRelayerEthBlock,
            generalEntity.lastCheckedPaymentRelayerCudosBlock === 1 ? parseInt(this.configService.get('APP_ETH_RELAYER_CUDOS_BLOCK_START')) : generalEntity.lastCheckedPaymentRelayerCudosBlock,
        );

        return res;
    }

    @Put('last-checked-payment-relayer-blocks')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @UseGuards(ApiKeyGuard)
    @SkipThrottle()
    async updateLastCheckedPaymentRelayerBlock(
        @Req() req: AppRequest,
        @Body() reqUpdateLastCheckedBlockRequest: ReqUpdateLastCheckedPaymentRelayerBlocksRequest,
    ): Promise<any> {
        return this.generalService.setLastCheckedPaymentRelayerBlocks(reqUpdateLastCheckedBlockRequest.lastCheckedEthBlock, reqUpdateLastCheckedBlockRequest.lastCheckedCudosBlock, req.transaction);
    }

    @Get('fetchSettings')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(20, 30)
    async fetchSettings(
        @Req() req: AppRequest,
    ): Promise < ResFetchSettings > {
        const settingsEntity = await this.generalService.fetchSettings(req.transaction);
        return new ResFetchSettings(settingsEntity);
    }

    @Post('creditSettings')
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(20, 30)
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
