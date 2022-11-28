import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import AccountEntity from '../../account/entities/account.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

    constructor(private authService: AuthService) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string): Promise < AccountEntity > {
        return this.authService.validateUser(email, password);
    }
}
