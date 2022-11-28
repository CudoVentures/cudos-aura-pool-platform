export class ReqLogin {

    email: string;
    password: string;
    cudosWalletAddress: string;
    walletName: string;
    signedTx: any;

    constructor(username: string, password: string, cudosWalletAddress: string, walletName: string, signedTx: any) {
        this.email = username;
        this.password = password;
        this.cudosWalletAddress = cudosWalletAddress;
        this.walletName = walletName;
        this.signedTx = signedTx;
    }

}

export class ReqRegister {

    email: string;
    password: string;
    cudosWalletAddress: string;
    name: string;
    signedTx: any;

    constructor(username: string, password: string, cudosWalletAddress: string, name: string, signedTx: any) {
        this.email = username;
        this.password = password;
        this.cudosWalletAddress = cudosWalletAddress;
        this.name = name;
        this.signedTx = signedTx;
    }

}
