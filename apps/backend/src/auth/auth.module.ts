import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.types';
import { AuthController } from './auth.controller';
import { AccountModule } from '../account/account.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [
        PassportModule,
        AccountModule,
        EmailModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
