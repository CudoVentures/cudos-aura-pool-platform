import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { decodeSignature, StdSignature } from 'cudosjs';
import { Transaction } from 'sequelize';
import AccountService from '../account/account.service';
import AccountEntity from '../account/entities/account.entity';
import AdminEntity from '../account/entities/admin.entity';
import UserEntity from '../account/entities/user.entity';
import { EmailAlreadyInUseException, WrongNonceSignatureException, WrongUserOrPasswordException } from '../common/errors/errors';
import { IntBoolValue } from '../common/utils';
import EmailService from '../email/email.service';
import JwtToken from './entities/jwt-token.entity';
import { SIGN_NONCE } from './auth.types';
import { verifyADR36Amino } from '@keplr-wallet/cosmos';

@Injectable()
export class AuthService {
    constructor(
        private accountService: AccountService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private emailService: EmailService,
    ) {}

    async register(email: string, pass: string, cudosWalletAddress: string, name: string, pubKeyType: string, pubKeyValue: string, signature: string, tx: Transaction = undefined): Promise < void > {
        const isSigner = await this.verifySignature(cudosWalletAddress, pubKeyType, pubKeyValue, signature);
        if (!isSigner) {
            throw new WrongNonceSignatureException();
        }

        let accountEntity = await this.accountService.findAccountByEmail(email, tx, tx.LOCK.UPDATE);
        let adminEntity = null;
        if (accountEntity !== null) {
            throw new EmailAlreadyInUseException();
        }

        accountEntity = AccountEntity.newInstanceAdmin();
        accountEntity.email = email;
        accountEntity.name = name;
        accountEntity.salt = AccountService.generateSalt();
        accountEntity.hashedPass = AccountService.generateHashedPass(pass, accountEntity.salt);
        accountEntity = await this.accountService.creditAccount(accountEntity, true, tx);

        adminEntity = AdminEntity.newInstanceForAccount(accountEntity.accountId);
        adminEntity.cudosWalletAddress = cudosWalletAddress;

        adminEntity = await this.accountService.creditAdmin(adminEntity, tx);

        await this.emailService.sendVerificationEmail(accountEntity);
    }

    async login(email: string, pass: string, cudosWalletAddress: string, walletName: string, pubKeyType: string, pubKeyValue: string, signature: string, tx: Transaction = undefined): Promise < string > {
        let accountEntity = null;
        if (email !== '' || pass !== '') {
            accountEntity = await this.loginUsingCredentials(email, pass);
        } else {
            accountEntity = await this.loginUsingWallet(cudosWalletAddress, walletName, pubKeyType, pubKeyValue, signature, tx);
        }

        // update last login time
        accountEntity.timestampLastLogin = Date.now();
        await this.accountService.creditAccount(accountEntity);

        const jwtToken = JwtToken.newInstance(accountEntity);
        return this.jwtService.sign(JwtToken.toJson(jwtToken), JwtToken.getConfig());
    }

    private async loginUsingCredentials(email: string, pass: string): Promise < AccountEntity > {
        const accountEntity = await this.accountService.findAccountByEmail(email);
        if (accountEntity === null) {
            throw new WrongUserOrPasswordException();
        }

        if (AccountService.isPassValid(accountEntity, pass) === false) {
            throw new WrongUserOrPasswordException();
        }

        return accountEntity;
    }

    private async loginUsingWallet(cudosWalletAddress: string, walletName: string, pubKeyType: any, pubKeyValue: any, signature: string, tx: Transaction = undefined): Promise < AccountEntity > {
        const isSigner = await this.verifySignature(cudosWalletAddress, pubKeyType, pubKeyValue, signature);
        if (!isSigner) {
            throw new WrongNonceSignatureException();
        }

        let accountEntity = null;
        let userEntity = await this.accountService.findUserByCudosWalletAddress(cudosWalletAddress, tx, tx.LOCK.UPDATE);

        if (userEntity === null) { // register new wallet
            accountEntity = new AccountEntity();
            accountEntity.name = walletName;
            accountEntity.emailVerified = IntBoolValue.TRUE;
            accountEntity = await this.accountService.creditAccount(accountEntity, true, tx);

            userEntity = new UserEntity();
            userEntity.accountId = accountEntity.accountId;
            userEntity.cudosWalletAddress = cudosWalletAddress;
            userEntity = await this.accountService.creditUser(userEntity, tx);
        } else {
            accountEntity = await this.accountService.findAccountById(userEntity.accountId);
        }

        return accountEntity;
    }

    private async verifySignature(cudosWalletAddress: string, pubKeyType: any, pubKeyValue: any, signature: string): Promise < boolean > {
        const signedTx: StdSignature = {
            pub_key: {
                type: pubKeyType,
                value: pubKeyValue,
            },
            signature,
        }

        const data = JSON.stringify({
            nonce: SIGN_NONCE,
        })

        const { pubkey: decodedPubKey, signature: decodedSignature } = decodeSignature(signedTx)

        const verified = verifyADR36Amino(
            'cudos',
            cudosWalletAddress,
            data,
            decodedPubKey,
            decodedSignature,
        )

        return verified;
    }

}
