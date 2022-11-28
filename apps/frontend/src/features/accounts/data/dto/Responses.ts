import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';

export class ResFetchSessionAccounts {

    accountEntity: AccountEntity;
    userEntity: UserEntity;
    adminEntity: AdminEntity;
    superAdminEntity: SuperAdminEntity;

    constructor(axiosData: any) {
        this.accountEntity = AccountEntity.fromJson(axiosData.accountEntity);
        this.userEntity = UserEntity.fromJson(axiosData.userEntity);
        this.adminEntity = AdminEntity.fromJson(axiosData.adminEntity);
        this.superAdminEntity = SuperAdminEntity.fromJson(axiosData.superAdminEntity);
    }

}

export class ResLogin {

    accessToken: string;

    constructor(axiosData: any) {
        this.accessToken = axiosData.accessToken;
    }

}
