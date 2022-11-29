import { Body, Controller, Request, Post, Get, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ReqLogin, ReqRegister } from './dto/requests.dto';
import { ResFetchSessionAccounts, ResLogin } from './dto/responses.dto';
import { RequestWithSessionAccounts } from './interfaces/request.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {}

    @Post('login')
    async login(@Body(new ValidationPipe({ transform: true })) reqLogin: ReqLogin): Promise < ResLogin > {
        const accessToken = await this.authService.login(reqLogin.email, reqLogin.password, reqLogin.cudosWalletAddress, reqLogin.bitcoinPayoutWalletAddress, reqLogin.walletName, reqLogin.pubKeyType, reqLogin.pubKeyValue, reqLogin.signature, reqLogin.sequence, reqLogin.accountNumber);
        return new ResLogin(accessToken);
    }

    @Post('register')
    async register(@Body(new ValidationPipe({ transform: true })) reqRegister: ReqRegister): Promise < void > {
        return this.authService.register(reqRegister.email, reqRegister.password, reqRegister.cudosWalletAddress, reqRegister.name, reqRegister.signedTx);
    }

    @Get('fetchSessionAccounts')
    async fetchSessionAccounts(@Request() req: RequestWithSessionAccounts): Promise < ResFetchSessionAccounts > {
        return new ResFetchSessionAccounts(req.sessionAccountEntity, req.sessionUserEntity, req.sessionAdminEntity, req.sessionSuperAdminEntity);
    }
}
