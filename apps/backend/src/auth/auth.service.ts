import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { decodeSignature, StdSignature } from 'cudosjs';
import { LOCK, Transaction } from 'sequelize';
import AccountService from '../account/account.service';
import AccountEntity from '../account/entities/account.entity';
import AdminEntity from '../account/entities/admin.entity';
import UserEntity from '../account/entities/user.entity';
import { AccountLockedException, EmailAlreadyInUseException, WrongNonceSignatureException, WrongUserOrPasswordException } from '../common/errors/errors';
import { IntBoolValue } from '../common/utils';
import EmailService from '../email/email.service';
import JwtToken from './entities/jwt-token.entity';
import { SIGN_NONCE } from './auth.types';
import { verifyADR36Amino } from '@keplr-wallet/cosmos';
import AddressMintDataEntity from '../nft/entities/address-mint-data.entity';

@Injectable()
export class AuthService {
    constructor(
        private accountService: AccountService,
        private jwtService: JwtService,
        private emailService: EmailService,
    ) {}

    // controller functions
    async login(email: string, pass: string, cudosWalletAddress: string, walletName: string, pubKeyType: string, pubKeyValue: string, signature: string, dbTx: Transaction): Promise < string > {
        let accountEntity = null;
        if (email !== '' || pass !== '') {
            accountEntity = await this.loginUsingCredentials(email, pass, dbTx);
        } else {
            accountEntity = await this.loginUsingWallet(cudosWalletAddress, walletName, pubKeyType, pubKeyValue, signature, dbTx);
        }

        // update last login time
        accountEntity.timestampLastLogin = Date.now();

        return this.regenerateToken(accountEntity, dbTx);
    }

    async regenerateToken(accountEntity: AccountEntity, dbTx: Transaction): Promise < string > {
        // update salt to generate new unique token later
        accountEntity.tokenSalt = AccountEntity.generateTokenSalt();
        await this.accountService.creditAccount(accountEntity, false, dbTx);

        const jwtToken = JwtToken.newInstance(accountEntity);
        return this.jwtService.sign(JwtToken.toJson(jwtToken), JwtToken.getConfig());
    }
    async register(email: string, pass: string, cudosWalletAddress: string, name: string, pubKeyType: string, pubKeyValue: string, signature: string, dbTx: Transaction): Promise < void > {
        const isSigner = await this.verifySignature(cudosWalletAddress, pubKeyType, pubKeyValue, signature);
        if (!isSigner) {
            throw new WrongNonceSignatureException();
        }

        let accountEntity = await this.accountService.findAccountByEmail(email, dbTx, dbTx.LOCK.UPDATE);
        let adminEntity = null;
        if (accountEntity !== null) {
            throw new EmailAlreadyInUseException();
        }

        accountEntity = AccountEntity.newInstanceAdmin();
        accountEntity.email = email;
        accountEntity.name = name;
        accountEntity.salt = AccountService.generateSalt();
        accountEntity.hashedPass = AccountService.generateHashedPass(pass, accountEntity.salt);
        accountEntity = await this.accountService.creditAccount(accountEntity, true, dbTx);

        adminEntity = AdminEntity.newInstanceForAccount(accountEntity.accountId);
        adminEntity.cudosWalletAddress = cudosWalletAddress;

        adminEntity = await this.accountService.creditAdmin(adminEntity, dbTx);

        await this.emailService.sendVerificationEmail(accountEntity);
    }

    public async createPresaleAccounts(addressMintDataEntity: AddressMintDataEntity, dbTx: Transaction): Promise < AccountEntity > {
        return this.creditUserAccounts(addressMintDataEntity.cudosAddress, `${addressMintDataEntity.firstName} ${addressMintDataEntity.lastName}`, dbTx);
    }

    // db functions
    private async loginUsingCredentials(email: string, pass: string, dbTx: Transaction): Promise < AccountEntity > {
        const accountEntity = await this.accountService.findAccountByEmail(email, dbTx);
        if (accountEntity === null) {
            throw new WrongUserOrPasswordException();
        }

        if (accountEntity.passedConsequitiveWrongPasswordAttemptsLimit()) {
            await this.emailService.sendLockedAccountEmail(accountEntity);
            throw new AccountLockedException();
        }

        if (AccountService.isPassValid(accountEntity, pass) === false) {
            accountEntity.consequitiveWrongPasswordAttemps++;
            await this.accountService.creditAccount(accountEntity, false, dbTx);

            if (accountEntity.passedConsequitiveWrongPasswordAttemptsLimit()) {
                await this.emailService.sendLockedAccountEmail(accountEntity);
                throw new AccountLockedException();
            }

            throw new WrongUserOrPasswordException();
        }

        if (accountEntity.consequitiveWrongPasswordAttemps !== 0) {
            accountEntity.resetConsequitiveWrongPasswordAttempts();
            await this.accountService.creditAccount(accountEntity, false, dbTx);
        }

        return accountEntity;
    }

    private async loginUsingWallet(cudosWalletAddress: string, walletName: string, pubKeyType: any, pubKeyValue: any, signature: string, dbTx: Transaction): Promise < AccountEntity > {
        const isSigner = await this.verifySignature(cudosWalletAddress, pubKeyType, pubKeyValue, signature);
        if (!isSigner) {
            throw new WrongNonceSignatureException();
        }

        return this.creditUserAccounts(cudosWalletAddress, walletName, dbTx);
    }

    private async creditUserAccounts(cudosWalletAddress: string, walletName: string, dbTx: Transaction): Promise < AccountEntity > {
        let accountEntity = null;
        let userEntity = await this.accountService.findUserByCudosWalletAddress(cudosWalletAddress, dbTx, dbTx.LOCK.UPDATE);

        if (userEntity === null) { // register new wallet
            accountEntity = new AccountEntity();
            accountEntity.name = walletName;
            accountEntity.emailVerified = IntBoolValue.TRUE;
            accountEntity = await this.accountService.creditAccount(accountEntity, true, dbTx);

            userEntity = new UserEntity();
            userEntity.accountId = accountEntity.accountId;
            userEntity.cudosWalletAddress = cudosWalletAddress;
            userEntity = await this.accountService.creditUser(userEntity, dbTx);
        } else {
            accountEntity = await this.accountService.findAccountById(userEntity.accountId, dbTx);
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
