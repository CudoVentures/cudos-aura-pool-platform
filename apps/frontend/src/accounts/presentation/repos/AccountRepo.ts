import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import { StdSignature } from 'cudosjs';
import AddressMintDataEntity from '../../../nft-presale/entities/AddressMintDataEntity';

export default interface AccountRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    login(username: string, password: string, cudosWalletAddress: string, walletName: string, signedTx: StdSignature | null, sequence: number, accountNumber: number): Promise < void >;
    register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: StdSignature, sequence: number, accountNumber: number): Promise < void >;
    logout(): Promise < void >;
    fetchSessionAccounts(): Promise < { accountEntity: AccountEntity, userEntity: UserEntity, adminEntity: AdminEntity, superAdminEntity: SuperAdminEntity, shouldChangePassword: number } >;
    editSessionAccount(accountEntity: AccountEntity): Promise < void >;
    editSessionUser(userEntity: UserEntity): Promise < void >;
    editSessionSuperAdmin(superAdminEntity: SuperAdminEntity): Promise < void >;
    editSessionAccountPass(oldPassword: string, newPassword: string, token: string): Promise < void > ;
    forgottenPassword(email: string): Promise < void >
    sendSessionAccountVerificationEmail(): Promise < void >
    fetchFarmOwnerAccount(accountId: string): Promise < AdminEntity >;

    createPresaleAccounts(addressMintDataEntities: AddressMintDataEntity[]): Promise < void >;
}
