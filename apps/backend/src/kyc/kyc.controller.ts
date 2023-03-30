import { Body, Controller, HttpCode, Post, Req, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AccountType } from '../account/account.types';
import RoleGuard from '../auth/guards/role.guard';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { IntBoolValue } from '../common/utils';
import { StatisticsService } from '../statistics/statistics.service';
import { ReqCreateWorkflowRun, ReqCreditKyc } from './dto/requests.dto';
import { ResFetchKyc, ResCreditKyc, ResCreateWorkflowRun } from './dto/responses.dto';
import { WorkflowRunParamsV1Entity } from './entities/workflow-run-params.entity';
import { KycService } from './kyc.service';

@Controller('kyc')
export class KycController {

    constructor(
        private kycService: KycService,
        private statisticsService: StatisticsService,
    ) {}

    @Post('fetchKyc')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async fetchKyc(
        @Req() req: AppRequest,
    ): Promise < ResFetchKyc > {
        let kycEntity = null;
        let purchasesInUsdSoFar = 0;
        if (req.sessionUserEntity !== null) {
            kycEntity = await this.kycService.fetchAndInvalidateKyc(req.sessionAccountEntity, req.transaction, req.transaction.LOCK.UPDATE);
            if (kycEntity.hasWorkflowRunWithFullParams() === false) {
                purchasesInUsdSoFar = await this.statisticsService.fetchUsersSpendingOnPlatformInUsd(req.sessionUserEntity, req.transaction);
            }
        }

        return new ResFetchKyc(kycEntity, purchasesInUsdSoFar);
    }

    @Post('creditKyc')
    @UseInterceptors(TransactionInterceptor)
    @UseGuards(RoleGuard([AccountType.USER]))
    @HttpCode(200)
    async creditKyc(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqCreditKyc: ReqCreditKyc,
    ): Promise < ResCreditKyc > {
        const reqKycEntity = reqCreditKyc.kycEntity;
        let kycEntity = await this.kycService.fetchKycByAccount(req.sessionAccountEntity, req.transaction, req.transaction.LOCK.UPDATE);
        kycEntity.firstName = reqKycEntity.firstName;
        kycEntity.lastName = reqKycEntity.lastName;
        await this.kycService.creditOnfidoApplicant(kycEntity);
        kycEntity = await this.kycService.creditKyc(kycEntity, req.transaction);

        const token = await this.kycService.generateOnfidoToken(kycEntity);
        return new ResCreditKyc(token, kycEntity);
    }

    @Post('createWorkflowRun')
    @UseInterceptors(TransactionInterceptor)
    @UseGuards(RoleGuard([AccountType.USER]))
    @HttpCode(200)
    async createWorkflowRun(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqCreateWorkflowRun: ReqCreateWorkflowRun,
    ): Promise < ResCreateWorkflowRun > {
        let purchasesInUsdSoFar = await this.statisticsService.fetchUsersSpendingOnPlatformInUsd(req.sessionUserEntity, req.transaction);
        let kycEntity = await this.kycService.fetchKycByAccount(req.sessionAccountEntity, req.transaction, req.transaction.LOCK.UPDATE);
        if (purchasesInUsdSoFar < WorkflowRunParamsV1Entity.LIGHT_PARAMS_LIMIT_IN_USD && reqCreateWorkflowRun.runFullWorkflow === IntBoolValue.TRUE) {
            purchasesInUsdSoFar = WorkflowRunParamsV1Entity.LIGHT_PARAMS_LIMIT_IN_USD + 1;
        }

        kycEntity = await this.kycService.createWorkflowRun(req.sessionUserEntity, purchasesInUsdSoFar, kycEntity, req.transaction);
        return new ResCreateWorkflowRun(kycEntity, kycEntity.getLatestWorkflowRunId());
    }

}
