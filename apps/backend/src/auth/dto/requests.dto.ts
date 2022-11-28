import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ReqLogin {

    @IsString()
        email: string;

    @IsString()
        password: string;

    @IsString()
        cudosWalletAddress: string;

    @IsString()
        walletName: string;

    @IsString()
        pubKeyType: string;

    @IsString()
        pubKeyValue: string;

    @IsString()
        signature: string;

    @IsNumber()
        sequence: number;

    @IsNumber()
        accountNumber: number;

}

export class ReqRegister {

    @IsString()
        email: string;

    @IsString()
        password: string;

    @IsString()
        cudosWalletAddress: string;

    @IsString()
        name: string;

    @IsString()
        signedTx: any;

}
