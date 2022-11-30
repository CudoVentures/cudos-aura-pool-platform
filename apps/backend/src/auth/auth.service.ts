import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StdSignature } from 'cudosjs';
import { verifyNonceMsgSigner } from 'cudosjs/build/utils/nonce';
import AccountService from '../account/account.service';
import AccountEntity from '../account/entities/account.entity';
import AdminEntity from '../account/entities/admin.entity';
import UserEntity from '../account/entities/user.entity';
import { IntBoolValue } from '../common/utils';
import { SIGN_NONCE } from './auth.types';
import JwtToken from './jwtToken.entity';

@Injectable()
export class AuthService {
    constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
    private configService: ConfigService,
    ) {}

    // async validateUser(email: string, password: string): Promise < AccountEntity > {
    //     const accountEntity = await this.accountService.findAccountByEmail(email);
    //     if (accountEntity === null) {
    //         throw new NotFoundException('Incorrect email');
    //     }

    //     if (AccountService.isPassValid(accountEntity, password) === false) {
    //         throw new UnauthorizedException('Incorrect password');
    //     }

    //     return accountEntity;
    // }

    // async login(accountEntity: AccountEntity) {
    //     const jwtToken = JwtToken.newInstance(accountEntity);
    //     const accessToken = this.jwtService.sign(JwtToken.toJson(jwtToken));
    //     return { accessToken }
    // }

    async register(email: string, pass: string, cudosWalletAddress: string, name: string, pubKeyType: string, pubKeyValue: string, signature: string, sequence: number, accountNumber: number): Promise < void > {
        const isSigner = await this.verifySignature(cudosWalletAddress, pubKeyType, pubKeyValue, signature, sequence, accountNumber);
        if (!isSigner) {
            throw new Error('Message not signed by user address.');
        }

        let accountEntity = await this.accountService.findAccountByEmail(email);
        let adminEntity = null;
        if (accountEntity !== null) {
            throw new NotFoundException('Email is already in use');
        }

        accountEntity = AccountEntity.newInstanceAdmin();
        accountEntity.email = email;
        accountEntity.name = name;
        accountEntity.salt = AccountService.generateSalt();
        accountEntity.hashedPass = AccountService.generateHashedPass(pass, accountEntity.salt);
        accountEntity = await this.accountService.creditAccount(accountEntity);

        adminEntity = AdminEntity.newInstanceForAccount(accountEntity.accountId);
        adminEntity.cudosWalletAddress = cudosWalletAddress;

        adminEntity = await this.accountService.creditAdmin(adminEntity);
    }

    async login(email: string, pass: string, cudosWalletAddress: string, bitcoinPayoutWalletAddress: string, walletName: string, pubKeyType: string, pubKeyValue: string, signature: string, sequence: number, accountNumber: number): Promise < string > {
        if (email !== '' || pass !== '') {
            return this.loginUsingCredentials(email, pass);
        }

        return this.loginUsingWallet(cudosWalletAddress, bitcoinPayoutWalletAddress, walletName, pubKeyType, pubKeyValue, signature, sequence, accountNumber);
    }

    private async loginUsingCredentials(email: string, pass: string): Promise < string > {
        const accountEntity = await this.accountService.findAccountByEmail(email);
        if (accountEntity === null) {
            throw new NotFoundException('Incorrect email');
        }

        if (AccountService.isPassValid(accountEntity, pass) === false) {
            throw new UnauthorizedException('Incorrect password');
        }

        const jwtToken = JwtToken.newInstance(accountEntity);
        return this.jwtService.sign(JwtToken.toJson(jwtToken));
    }

    private async loginUsingWallet(cudosWalletAddress: string, bitcoinPayoutWalletAddress: string, walletName: string, pubKeyType: any, pubKeyValue: any, signature: string, sequence: number, accountNumber: number): Promise < string > {
        const isSigner = await this.verifySignature(cudosWalletAddress, pubKeyType, pubKeyValue, signature, sequence, accountNumber);
        if (!isSigner) {
            throw new Error('Message not signed by user address.');
        }

        let accountEntity = null;
        let userEntity = await this.accountService.findUserByCudosWalletAddress(cudosWalletAddress);

        if (userEntity === null) { // register new wallet
            accountEntity = new AccountEntity();
            accountEntity.name = walletName;
            accountEntity.emailVerified = IntBoolValue.TRUE;
            accountEntity = await this.accountService.creditAccount(accountEntity);

            userEntity = new UserEntity();
            userEntity.accountId = accountEntity.accountId;
            userEntity.cudosWalletAddress = cudosWalletAddress;
            userEntity.bitcoinPayoutWalletAddress = bitcoinPayoutWalletAddress;
            userEntity = await this.accountService.creditUser(userEntity);
        } else {
            accountEntity = await this.accountService.findAccountById(userEntity.accountId);
        }

        const jwtToken = JwtToken.newInstance(accountEntity);
        return this.jwtService.sign(JwtToken.toJson(jwtToken));
    }

    private async verifySignature(cudosWalletAddress: string, pubKeyType: any, pubKeyValue: any, signature: string, sequence: number, accountNumber: number): Promise < boolean > {
        const signedTx: StdSignature = {
            pub_key: {
                type: pubKeyType,
                value: pubKeyValue,
            },
            signature,
        }

        const chainId = this.configService.get('APP_CUDOS_CHAIN_ID');
        return verifyNonceMsgSigner(signedTx, cudosWalletAddress, SIGN_NONCE, sequence, accountNumber, chainId);
    }

}
