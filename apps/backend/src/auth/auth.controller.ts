import { Body, Controller, Request, Post, UseGuards, Get, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ReqLogin } from './dto/requests.dto';
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
    async login(@Request() req, @Body(new ValidationPipe({ transform: true })) reqLogin: ReqLogin): Promise < ResLogin > {
        const accessToken = await this.authService.login(reqLogin.email, reqLogin.password, reqLogin.cudosWalletAddress, reqLogin.walletName, reqLogin.pubKeyType, reqLogin.pubKeyValue, reqLogin.signature, reqLogin.sequence, reqLogin.accountNumber);
        return new ResLogin(accessToken);
    }

    @Post('register')
    async register(@Request() req, @Body() registerDto: RegisterDto) {
        // return this.userService.createFarmAdmin(registerDto)
    }

    @Get('fetchSessionAccounts')
    async fetchSessionAccounts(@Request() req: RequestWithSessionAccounts): Promise < ResFetchSessionAccounts > {
        return new ResFetchSessionAccounts(req.sessionAccountEntity, req.sessionUserEntity, req.sessionAdminEntity, req.sessionSuperAdminEntity);
    }
}
