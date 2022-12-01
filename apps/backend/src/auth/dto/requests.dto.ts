import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ReqLogin {

    @IsString()
        email: string;

    @IsString()
        password: string;

    @IsString()
        cudosWalletAddress: string;

    @IsString()
        bitcoinPayoutWalletAddress: string;

    @IsString()
        walletName: string;

    @IsString()
    @IsOptional()
        pubKeyType: string;

    @IsString()
    @IsOptional()
        pubKeyValue: string;

    @IsString()
    @IsOptional()
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
