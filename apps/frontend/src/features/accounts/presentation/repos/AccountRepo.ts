import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';

export default interface AccountRepo {

    login(username: string, password: string, cudosWalletAddress: string, signedTx: any): Promise < void >;
    register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: any): Promise < void >;
    logout(): Promise < void >;
    confirmBitcoinAddress(): Promise < void >;
    creditAccount(accountEntity: AccountEntity): Promise < void >;
    changePassword(token: string, accountId: string, oldPassword: string, newPassword: string): Promise < void > ;
    forgottenPassword(email: string): Promise < void >
    sendVerificationEmail(): Promise < void >
    fetchSessionAccounts(): Promise < { accountEntity: AccountEntity, userEntity: UserEntity, adminEntity: AdminEntity, superAdminEntity: SuperAdminEntity } >;
}
