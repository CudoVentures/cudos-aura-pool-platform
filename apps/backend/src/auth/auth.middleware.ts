import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { ExtractJwt } from 'passport-jwt';
import AccountService from '../account/account.service';
import { RequestWithSessionAccounts } from '../common/commont.types';
import { pbkdf2Sync } from 'node:crypto';
import { Sequelize, Transaction } from 'sequelize';
import { InjectConnection } from '@nestjs/sequelize';
import JwtCudoService from '../jwt/jwt.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {

    constructor(
        private jwtService: JwtCudoService,
        private accountService: AccountService,
        @InjectConnection()
        private readonly sequelizeInstance: Sequelize,
    ) {}

    async use(req: RequestWithSessionAccounts, res: Response, next: NextFunction) {
        const extractorFunction = ExtractJwt.fromAuthHeaderAsBearerToken();

        const encodedToken = extractorFunction(req);
        const transaction: Transaction = await this.sequelizeInstance.transaction();

        try {
            const jwtToken = this.jwtService.decodeToken(encodedToken);
            const accounts = await this.accountService.findAccounts(jwtToken.id, transaction);

            const derivedKey = pbkdf2Sync(accounts.accountEntity.hashedPass.substring(0, 10), accounts.accountEntity.tokenSalt, 100000, 64, 'sha512');

            if (derivedKey.toString('hex') !== jwtToken.derivedKey) {
                throw new Error();
            }

            req.sessionAccountEntity = accounts.accountEntity;
            req.sessionUserEntity = accounts.userEntity;
            req.sessionAdminEntity = accounts.adminEntity;
            req.sessionSuperAdminEntity = accounts.superAdminEntity;

            await transaction.commit();
        } catch (ex) {
            req.sessionAccountEntity = null;
            req.sessionUserEntity = null;
            req.sessionAdminEntity = null;
            req.sessionSuperAdminEntity = null;
            await transaction.rollback();
        }

        next();
    }

}
