import crypto from 'crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { UUID_COOKIE_KEY } from './visitor.types';

@Injectable()
export class VisitorMiddleware implements NestMiddleware {

    constructor(private configService: ConfigService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const appCookiesSecret = this.configService.get < number >('APP_COOKIES_SECRET') ?? undefined;

        const uuid = req.signedCookies[UUID_COOKIE_KEY];
        if (uuid === undefined) {
            res.cookie(UUID_COOKIE_KEY, crypto.randomUUID(), {
                secure: true,
                httpOnly: true,
                signed: appCookiesSecret !== undefined,
                sameSite: true,
            });
        }

        next();
    }

}
