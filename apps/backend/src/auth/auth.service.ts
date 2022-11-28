import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import AccountService from '../account/account.service';
import AccountEntity from '../account/entities/account.entity';
import UserEntity from '../account/entities/user.entity';
import { IntBoolValue } from '../common/utils';
import JwtToken from './jwtToken.entity';

@Injectable()
export class AuthService {
    constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise < AccountEntity > {
        const accountEntity = await this.accountService.findAccountByEmail(email);
        if (accountEntity === null) {
            throw new NotFoundException('Incorrect email');
        }

        if (AccountService.isPassValid(accountEntity, password) === false) {
            throw new UnauthorizedException('Incorrect password');
        }

        return accountEntity;
    }

    // async login(accountEntity: AccountEntity) {
    //     const jwtToken = JwtToken.newInstance(accountEntity);
    //     const accessToken = this.jwtService.sign(JwtToken.toJson(jwtToken));
    //     return { accessToken }
    // }

    async login(email: string, pass: string, cudosWalletAddress: string, walletName: string, signedTx: any): Promise < string > {
        if (email !== '' || pass !== '') {
            return this.loginUsingCredentials(email, pass);
        }

        return this.loginUsingWallet(cudosWalletAddress, walletName, signedTx);

        // const jwtToken = JwtToken.newInstance(accountEntity);
        // const accessToken = this.jwtService.sign(JwtToken.toJson(jwtToken));
        // return { accessToken }
    }

    private async loginUsingCredentials(email: string, pass: string): Promise < string > {
        const accountEntity = await this.validateUser(email, pass);

        const jwtToken = JwtToken.newInstance(accountEntity);
        return this.jwtService.sign(JwtToken.toJson(jwtToken));
    }

    private async loginUsingWallet(cudosWalletAddress: string, walletName: string, signedTx: any): Promise < string > {
        let accountEntity = null;
        let userEntity = await this.accountService.findUserByCudosWalletAddress(cudosWalletAddress);

        console.log(userEntity);
        if (userEntity === null) { // register new wallet
            accountEntity = new AccountEntity();
            userEntity = new UserEntity();

            accountEntity.name = walletName;
            accountEntity.emailVerified = IntBoolValue.TRUE;

            userEntity.cudosWalletAddress = cudosWalletAddress;

            accountEntity = await this.accountService.creditAccount(accountEntity);
            userEntity.accountId = accountEntity.accountId;

            userEntity = await this.accountService.creditUser(userEntity);
        } else {
            accountEntity = await this.accountService.findAccountById(userEntity.accountId);
        }

        const jwtToken = JwtToken.newInstance(accountEntity);
        return this.jwtService.sign(JwtToken.toJson(jwtToken));
    }

}
