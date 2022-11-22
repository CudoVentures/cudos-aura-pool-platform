import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import JwtToken from './jwtToken.entity';

@Injectable()
export class AuthService {
    constructor(
    private userService: UserService,
    private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userService.findOne(email);
        if (!user) {
            throw new NotFoundException('Incorrect email');
        }

        const hashedPass = this.userService.generateHashedPass(password, user.salt);

        if (user.hashed_pass !== hashedPass) {
            throw new UnauthorizedException('Incorrect password');
        }

        return user.toJSON();
    }

    async login(user: any) {
        const jwtToken = JwtToken.newInstance(user);
        const accessToken = this.jwtService.sign(JwtToken.toJson(jwtToken));
        return { accessToken }
    }
}
