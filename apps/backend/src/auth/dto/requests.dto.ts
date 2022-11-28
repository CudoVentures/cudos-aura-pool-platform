import { IsOptional, IsString } from 'class-validator';

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
        signedTx: any;

}
