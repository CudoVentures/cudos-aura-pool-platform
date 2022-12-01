import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.types';
import { AuthController } from './auth.controller';
import { AccountModule } from '../account/account.module';
import EmailService from '../email/email.service';

@Module({
    imports: [
        PassportModule,
        AccountModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    providers: [AuthService, EmailService],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
