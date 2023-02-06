import { Body, Controller, HttpCode, Post, Req, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountType } from '../account/account.types';
import RoleGuard from '../auth/guards/role.guard';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { ReqCreditKyc } from './dto/requests.dto';
import { ResFetchKyc, ResCreditKyc, ResCreateCheck } from './dto/responses.dto';
import { KycService } from './kyc.service';

@ApiTags('Kyc')
@Controller('kyc')
export class KycController {

    constructor(private kycService: KycService) {}

    @UseInterceptors(TransactionInterceptor)
    @Post('fetchKyc')
    @HttpCode(200)
    async fetchKyc(
        @Req() req: AppRequest,
    ): Promise < ResFetchKyc > {
        let kycEntity = null;
        if (req.sessionAccountEntity !== null) {
            kycEntity = await this.kycService.fetchAndInvalidateKyc(req.sessionAccountEntity);
        }

        return new ResFetchKyc(kycEntity);
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
    @Post('createCheck')
    @HttpCode(200)
    async createCheck(
        @Req() req: AppRequest,
    ): Promise < ResCreateCheck > {
        let kycEntity = await this.kycService.fetchKycByAccount(req.sessionAccountEntity, req.transaction);
        kycEntity = await this.kycService.createOnfidoCheck(kycEntity, req.transaction);
        return new ResCreateCheck(kycEntity);
    }

}
