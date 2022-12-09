import { Body, Controller, Post, Get, ValidationPipe, Req, UseInterceptors, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest, RequestWithSessionAccounts } from '../common/commont.types';
import { AuthService } from './auth.service';
import { ReqLogin, ReqRegister } from './dto/requests.dto';
import { ResFetchSessionAccounts, ResLogin } from './dto/responses.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {}

    @UseInterceptors(TransactionInterceptor)
    @Post('login')
    @HttpCode(200)
    async login(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqLogin: ReqLogin,
    ): Promise < ResLogin > {
        const accessToken = await this.authService.login(reqLogin.email, reqLogin.password, reqLogin.cudosWalletAddress, reqLogin.bitcoinPayoutWalletAddress, reqLogin.walletName, reqLogin.pubKeyType, reqLogin.pubKeyValue, reqLogin.signature, reqLogin.sequence, reqLogin.accountNumber, req.transaction);
        return new ResLogin(accessToken);
    }

    @UseInterceptors(TransactionInterceptor)
    @Post('register')
    @HttpCode(200)
    async register(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqRegister: ReqRegister,
    ): Promise < void > {
        return this.authService.register(reqRegister.email, reqRegister.password, reqRegister.cudosWalletAddress, reqRegister.name, reqRegister.pubKeyType, reqRegister.pubKeyValue, reqRegister.signature, reqRegister.sequence, reqRegister.accountNumber, req.transaction);
    }

    @Get('fetchSessionAccounts')
    @HttpCode(200)
    async fetchSessionAccounts(@Req() req: RequestWithSessionAccounts): Promise < ResFetchSessionAccounts > {
        return new ResFetchSessionAccounts(req.sessionAccountEntity, req.sessionUserEntity, req.sessionAdminEntity, req.sessionSuperAdminEntity);
    }
}
