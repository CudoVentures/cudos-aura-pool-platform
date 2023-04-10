import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import JwtToken from './entities/jwt-token.entity';
import AccountEntity from '../account/entities/account.entity';
import { WrongVerificationTokenException } from '../common/errors/errors';

@Injectable()
export default class JwtCudoService {

    lockedAccountEmailSentTimestamps: Map < string, number >;
    appPublicUrl: string;
    emailFrom: string;
    transport: any;

    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
    ) {
    }

    fromAccount(accountEntity: AccountEntity, expiresIn?: string): string {
        const jwtToken = JwtToken.newInstance(accountEntity);
        return this.sign(JwtToken.toJson(jwtToken), expiresIn);
    }

    decodeToken(encodedToken: string): JwtToken {
        try {
            this.jwtService.verify(encodedToken, this.getConfig());
            const jwtToken = JwtToken.fromJson(this.jwtService.decode(encodedToken));

            return jwtToken;
        } catch (e) {
            throw new WrongVerificationTokenException();
        }
    }

    private sign(jwtToken: any, expiresIn = '20m'): string {
        return this.jwtService.sign(JwtToken.toJson(jwtToken), this.getConfig(expiresIn));
    }

    private getConfig(expiresIn = '20m'): any {
        return {
            expiresIn,
            secret: this.configService.getOrThrow('APP_JWT_SECRET'),
        };
    }
}
