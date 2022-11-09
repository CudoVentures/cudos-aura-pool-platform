import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import { Ledger } from 'cudosjs';

export default interface AccountRepo {

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void);

    login(username: string, password: string, cudosWalletAddress: string, walletName: string, signedTx: any): Promise < void >;
    register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: any): Promise < void >;
    logout(): Promise < void >;
    confirmBitcoinAddress(bitcoinAddress: string, ledger: Ledger, network: string): Promise < void >;
    creditAccount(accountEntity: AccountEntity): Promise < void >;
    changePassword(token: string, accountId: string, oldPassword: string, newPassword: string): Promise < void > ;
    forgottenPassword(email: string): Promise < void >
    sendVerificationEmail(): Promise < void >
    fetchSessionAccounts(): Promise < { accountEntity: AccountEntity, userEntity: UserEntity, adminEntity: AdminEntity, superAdminEntity: SuperAdminEntity } >;
}
