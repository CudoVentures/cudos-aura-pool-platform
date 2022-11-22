import { Body, Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private userService: UserService, private jwtService: JwtService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req, @Body() loginDto: LoginDto) {
        return this.authService.login(req.user);
    }

    @Post('register')
    async register(@Request() req, @Body() registerDto: RegisterDto) {
        return this.userService.createFarmAdmin(registerDto)
    }

    @Get('fetchSessionAccounts')
    async fetchSessionAccounts(@Request() req): Promise < User > {
        return req.sessionUser;
    }
}
