import { Body, Controller, Post, Get, ValidationPipe, Req, UseInterceptors, HttpCode, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AccountType } from '../account/account.types';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { parseIntBoolValue } from '../common/utils';
import { KycService } from '../kyc/kyc.service';
import AddressMintDataEntity from '../nft/entities/address-mint-data.entity';
import { AuthService } from './auth.service';
import { ReqCreatePresaleAccounts, ReqLogin, ReqRegister } from './dto/requests.dto';
import { ResFetchSessionAccounts, ResLogin } from './dto/responses.dto';
import RoleGuard from './guards/role.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private kycService: KycService,
    ) {}

    @UseInterceptors(TransactionInterceptor)
    @Post('login')
    @HttpCode(200)
    @UseGuards(ThrottlerGuard)
    @Throttle(5, 30)
    async login(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqLogin: ReqLogin,
    ): Promise < ResLogin > {
        const accessToken = await this.authService.login(reqLogin.email, reqLogin.password, reqLogin.cudosWalletAddress, reqLogin.walletName, reqLogin.pubKeyType, reqLogin.pubKeyValue, reqLogin.signature, req.transaction);
        return new ResLogin(accessToken);
    }

    @UseInterceptors(TransactionInterceptor)
    @Post('register')
    @HttpCode(200)
    async register(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqRegister: ReqRegister,
    ): Promise < void > {
        return this.authService.register(reqRegister.email, reqRegister.password, reqRegister.cudosWalletAddress, reqRegister.name, reqRegister.pubKeyType, reqRegister.pubKeyValue, reqRegister.signature, req.transaction);
    }

    @Get('fetchSessionAccounts')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async fetchSessionAccounts(@Req() req: AppRequest): Promise < ResFetchSessionAccounts > {
        const shouldChangePassword = req.sessionAccountEntity?.isDefaultSuperAdminPassword() ?? false;

        const accessToken = req.sessionAccountEntity !== null
            ? await this.authService.regenerateToken(req.sessionAccountEntity, req.transaction)
            : '';

        return new ResFetchSessionAccounts(accessToken, req.sessionAccountEntity, req.sessionUserEntity, req.sessionAdminEntity, req.sessionSuperAdminEntity, parseIntBoolValue(shouldChangePassword));
    }

    @UseInterceptors(TransactionInterceptor)
    @Post('createPresaleAccounts')
    @HttpCode(200)
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
    async createPresaleAccounts(
        @Req() req: AppRequest,
        @Body() reqCreatePresaleAccounts: ReqCreatePresaleAccounts,
    ): Promise<void> {
        for (let i = reqCreatePresaleAccounts.addressMintDataEntities.length; i-- > 0;) {
            const addressMintDataEntity = AddressMintDataEntity.fromJson(reqCreatePresaleAccounts.addressMintDataEntities[i]);
            if (addressMintDataEntity.hasAccountData() === false) {
                console.log('skipping', addressMintDataEntity);
                continue;
            }

            const accountEntity = await this.authService.createPresaleAccounts(addressMintDataEntity, req.transaction);
            await this.kycService.creditKycForPresale(accountEntity, addressMintDataEntity, req.transaction);
        }
    }

}
