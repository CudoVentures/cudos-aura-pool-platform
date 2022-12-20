import { StdSignature } from '@cosmjs/amino';
import AccountEntity from '../../entities/AccountEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';

export class ReqLogin {

    email: string;
    password: string;
    cudosWalletAddress: string;
    walletName: string;
    pubKeyType: string;
    pubKeyValue: string;
    signature: string;
    sequence: number;
    accountNumber: number;

    constructor(username: string, password: string, cudosWalletAddress: string, walletName: string, signedTx: StdSignature | null, sequence: number, accountNumber: number) {
        this.email = username;
        this.password = password;
        this.cudosWalletAddress = cudosWalletAddress;
        this.walletName = walletName;
        this.pubKeyType = signedTx?.pub_key.type ?? '';
        this.pubKeyValue = signedTx?.pub_key.value ?? '';
        this.signature = signedTx?.signature ?? '';
        this.sequence = sequence;
        this.accountNumber = accountNumber;
    }

}

export class ReqRegister {

    email: string;
    password: string;
    cudosWalletAddress: string;
    name: string;
    pubKeyType: string;
    pubKeyValue: string;
    signature: string;
    sequence: number;
    accountNumber: number;

    constructor(username: string, password: string, cudosWalletAddress: string, name: string, signedTx: StdSignature | null, sequence: number, accountNumber: number) {
        this.email = username;
        this.password = password;
        this.cudosWalletAddress = cudosWalletAddress;
        this.name = name;
        this.pubKeyType = signedTx.pub_key.type;
        this.pubKeyValue = signedTx.pub_key.value;
        this.signature = signedTx.signature;
        this.sequence = sequence;
        this.accountNumber = accountNumber;
    }

}

export class ReqEditSessionAccount {

    accountEntity: AccountEntity;

    constructor(accountEntity: AccountEntity) {
        this.accountEntity = AccountEntity.toJson(accountEntity);
    }

}

export class ReqEditSessionUser {

    userEntity: UserEntity;

    constructor(userEntity: UserEntity) {
        this.userEntity = UserEntity.toJson(userEntity);
    }

}

export class ReqEditSessionSuperAdmin {

    superAdminEntity: SuperAdminEntity;

    constructor(superAdminEntity: SuperAdminEntity) {
        this.superAdminEntity = SuperAdminEntity.toJson(superAdminEntity);
    }

}

export class ReqEditSessionAccountPass {

    oldPass: string;
    newPass: string;
    token: string;

    constructor(oldPass: string, newPass: string, token: string) {
        this.oldPass = oldPass;
        this.newPass = newPass;
        this.token = token;
    }

}

export class ReqForgottenPassword {

    email: string;

    constructor(email: string) {
        this.email = email;
    }

}
