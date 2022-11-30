import { StdSignature } from '@cosmjs/amino';
import AccountEntity from '../../entities/AccountEntity';

export class ReqLogin {

    email: string;
    password: string;
    cudosWalletAddress: string;
    bitcoinPayoutWalletAddress: string;
    walletName: string;
    pubKeyType: string;
    pubKeyValue: string;
    signature: string;
    sequence: number;
    accountNumber: number;

    constructor(username: string, password: string, cudosWalletAddress: string, bitcoinPayoutWalletAddress: string, walletName: string, signedTx: StdSignature | null, sequence: number, accountNumber: number) {
        this.email = username;
        this.password = password;
        this.cudosWalletAddress = cudosWalletAddress;
        this.bitcoinPayoutWalletAddress = bitcoinPayoutWalletAddress;
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

export class ReqCreditSessionAccount {

    accountEntity: AccountEntity;

    constructor(accountEntity: AccountEntity) {
        this.accountEntity = AccountEntity.toJson(accountEntity);
    }

}
