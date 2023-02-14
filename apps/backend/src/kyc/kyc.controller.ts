import { Body, Controller, HttpCode, Post, Req, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountType } from '../account/account.types';
import RoleGuard from '../auth/guards/role.guard';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { IntBoolValue } from '../common/utils';
import { StatisticsService } from '../statistics/statistics.service';
import { ReqCreateWorkflowRun, ReqCreditKyc } from './dto/requests.dto';
import { ResFetchKyc, ResCreditKyc, ResCreateWorkflowRun } from './dto/responses.dto';
import { KycService } from './kyc.service';

@ApiTags('Kyc')
@Controller('kyc')
export class KycController {

    constructor(
        private kycService: KycService,
        private statisticsService: StatisticsService,
    ) {}

    @UseInterceptors(TransactionInterceptor)
    @Post('fetchKyc')
    @HttpCode(200)
    async fetchKyc(
        @Req() req: AppRequest,
    ): Promise < ResFetchKyc > {
        let kycEntity = null;
        let purchasesInUsdSoFar = 0;
        if (req.sessionAccountEntity !== null) {
            kycEntity = await this.kycService.fetchAndInvalidateKyc(req.sessionAccountEntity);
            if (kycEntity.hasWorkflowRunWithFullParams() === false) {
                purchasesInUsdSoFar = await this.statisticsService.fetchUsersSpendingOnPlatformInUsd(req.sessionUserEntity);
            }
        }

        return new ResFetchKyc(kycEntity, purchasesInUsdSoFar);
    }

    @UseGuards(RoleGuard([AccountType.USER]))
    @UseInterceptors(TransactionInterceptor)
    @Post('creditKyc')
    @HttpCode(200)
    async creditKyc(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqCreditKyc: ReqCreditKyc,
    ): Promise < ResCreditKyc > {
        const reqKycEntity = reqCreditKyc.kycEntity;
        let kycEntity = await this.kycService.fetchKycByAccount(req.sessionAccountEntity, req.transaction);
        kycEntity.firstName = reqKycEntity.firstName;
        kycEntity.lastName = reqKycEntity.lastName;
        await this.kycService.creditOnfidoApplicant(kycEntity);
        kycEntity = await this.kycService.creditKyc(kycEntity, req.transaction);

        const token = await this.kycService.generateOnfidoToken(kycEntity);
        return new ResCreditKyc(token, kycEntity);
    }

    @UseGuards(RoleGuard([AccountType.USER]))
    @UseInterceptors(TransactionInterceptor)
    @Post('createWorkflowRun')
    @HttpCode(200)
    async createWorkflowRun(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqCreateWorkflowRun: ReqCreateWorkflowRun,
    ): Promise < ResCreateWorkflowRun > {
        let purchasesInUsdSoFar = await this.statisticsService.fetchUsersSpendingOnPlatformInUsd(req.sessionUserEntity);
        let kycEntity = await this.kycService.fetchKycByAccount(req.sessionAccountEntity, req.transaction);
        if (purchasesInUsdSoFar <= 1000 && reqCreateWorkflowRun.runFullWorkflow === IntBoolValue.TRUE) {
            purchasesInUsdSoFar = 1000.001;
        }

        kycEntity = await this.kycService.createWorkflowRun(req.sessionUserEntity, purchasesInUsdSoFar, kycEntity, req.transaction);
        return new ResCreateWorkflowRun(kycEntity);
    }

}