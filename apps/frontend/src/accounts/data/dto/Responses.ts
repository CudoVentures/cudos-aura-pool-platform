import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';

export class ResFetchSessionAccounts {

    accessToken: string;
    accountEntity: AccountEntity;
    userEntity: UserEntity;
    adminEntity: AdminEntity;
    superAdminEntity: SuperAdminEntity;
    shouldChangePassword: number;

    constructor(axiosData: any) {
        this.accessToken = axiosData.accessToken;
        this.accountEntity = AccountEntity.fromJson(axiosData.accountEntity);
        this.userEntity = UserEntity.fromJson(axiosData.userEntity);
        this.adminEntity = AdminEntity.fromJson(axiosData.adminEntity);
        this.superAdminEntity = SuperAdminEntity.fromJson(axiosData.superAdminEntity);
        this.shouldChangePassword = parseInt(axiosData.shouldChangePassword);
    }

}

export class ResLogin {

    accessToken: string;

    constructor(axiosData: any) {
        this.accessToken = axiosData.accessToken;
    }

}

export class ResEditSessionAccount {

    accountEntity: AccountEntity;

    constructor(axiosData: any) {
        this.accountEntity = AccountEntity.fromJson(axiosData.accountEntity);
    }

}

export class ResEditSessionUser {

    userEntity: UserEntity;

    constructor(axiosData: any) {
        this.userEntity = UserEntity.fromJson(axiosData.userEntity);
    }

}

export class ResEditSessionSuperAdmin {
    superAdminEntity: SuperAdminEntity;

    constructor(axiosData: any) {
        this.superAdminEntity = SuperAdminEntity.fromJson(axiosData.superAdminEntity);
    }

}

export class ResFetchFarmOwnerAccount {

    adminEntity: AdminEntity;

    constructor(axiosData: any) {
        this.adminEntity = AdminEntity.fromJson(axiosData.adminEntity);
    }

}
