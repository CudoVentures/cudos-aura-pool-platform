import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import { StdSignature } from 'cudosjs';
import { CudosSigningStargateClient } from 'cudosjs/build/stargate/cudos-signingstargateclient';

export default interface AccountRepo {

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void);

    login(username: string, password: string, cudosWalletAddress: string, bitcoinPayoutWalletAddress: string, walletName: string, signedTx: StdSignature | null, sequence: number, accountNumber: number): Promise < void >;
    register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: StdSignature, sequence: number, accountNumber: number): Promise < void >;
    logout(): Promise < void >;
    fetchSessionAccounts(): Promise < { accountEntity: AccountEntity, userEntity: UserEntity, adminEntity: AdminEntity, superAdminEntity: SuperAdminEntity } >;
    creditSessionAccount(accountEntity: AccountEntity): Promise < void >;
    editSessionAccountPass(oldPassword: string, newPassword: string, token: string): Promise < void > ;
    forgottenPassword(email: string): Promise < void >
    sendVerificationEmail(): Promise < void >

    confirmBitcoinAddress(client: CudosSigningStargateClient, cudosWalletAddress: string, bitcoinAddress: string): Promise < boolean >
    fetchBitcoinAddress(cudosAddress: string): Promise < string >;
}
