import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AccountModule } from '../account/account.module';
import { EmailModule } from '../email/email.module';
import { KycModule } from '../kyc/kyc.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtCudoModule } from '../jwt/jwt.module';

@Module({
    imports: [
        PassportModule,
        AccountModule,
        EmailModule,
        KycModule,
        JwtCudoModule,
        ThrottlerModule.forRoot({
            ttl: 30,
            limit: 1,
        }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
