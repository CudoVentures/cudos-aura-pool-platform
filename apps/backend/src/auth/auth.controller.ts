import { Body, Controller, Request, Post, UseGuards, Get, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ReqLogin, ReqRegister } from './dto/requests.dto';
import { ResFetchSessionAccounts, ResLogin } from './dto/responses.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestWithSessionAccounts } from './interfaces/request.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {}

    // @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Body(new ValidationPipe({ transform: true })) reqLogin: ReqLogin): Promise < ResLogin > {
        const accessToken = await this.authService.login(reqLogin.email, reqLogin.password, reqLogin.cudosWalletAddress, reqLogin.walletName, reqLogin.signedTx);
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
