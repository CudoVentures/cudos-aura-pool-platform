import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import JwtToken from './jwtToken.entity';
import { UserService } from '../user/user.service';
import { RequestWithSessionAccounts } from './interfaces/request.interface';
import AccountService from '../account/account.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {

    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
        private accountService: AccountService,
    ) {}

    async use(req: RequestWithSessionAccounts, res: Response, next: NextFunction) {
        const extractorFunction = ExtractJwt.fromAuthHeaderAsBearerToken();
        const encodedToken = extractorFunction(req);

        try {
            this.jwtService.verify(encodedToken);
            const jwtToken = JwtToken.fromJson(this.jwtService.decode(encodedToken));

            const accounts = await this.accountService.findAccounts(jwtToken.id);
            req.sessionAccountEntity = accounts.accountEntity;
            req.sessionUserEntity = accounts.userEntity;
            req.sessionAdminEntity = accounts.adminEntity;
            req.sessionSuperAdminEntity = accounts.superAdminEntity;
        } catch (ex) {
            req.sessionAccountEntity = null;
            req.sessionUserEntity = null;
            req.sessionAdminEntity = null;
            req.sessionSuperAdminEntity = null;
        }

        next();
    }

}
