import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AccountModule } from '../account/account.module';

@Module({
    imports: [
        UserModule,
        PassportModule,
        AccountModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    providers: [AuthService, UserService],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
