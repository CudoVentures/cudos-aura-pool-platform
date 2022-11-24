import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import JwtToken from './jwtToken.entity';
import { UserService } from '../user/user.service';
import { RequestWithSessionUser } from './interfaces/request.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {

    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
        private userService: UserService,
    ) {}

    async use(req: RequestWithSessionUser, res: Response, next: NextFunction) {
        const extractorFunction = ExtractJwt.fromAuthHeaderAsBearerToken();
        const encodedToken = extractorFunction(req);

        try {
            this.jwtService.verify(encodedToken);
            const jwtToken = JwtToken.fromJson(this.jwtService.decode(encodedToken));
            req.sessionUser = await this.userService.findById(jwtToken.id);
        } catch (ex) {
            req.sessionUser = null;
        }

        next();
    }

}
