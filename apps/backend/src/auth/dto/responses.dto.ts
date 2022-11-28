import AccountEntity from '../../account/entities/account.entity';
import AdminEntity from '../../account/entities/admin.entity';
import SuperAdminEntity from '../../account/entities/super-admin.entity';
import UserEntity from '../../account/entities/user.entity';

export class ResFetchSessionAccounts {

    accountEntity: any;
    userEntity: any;
    adminEntity: any;
    superAdminEntity: any;

    constructor(accountEntity: AccountEntity, userEntity: UserEntity, adminEntity: AdminEntity, superAdminEntity: SuperAdminEntity) {
        this.accountEntity = AccountEntity.toJson(accountEntity);
        this.userEntity = UserEntity.toJson(userEntity);
        this.adminEntity = AdminEntity.toJson(adminEntity);
        this.superAdminEntity = SuperAdminEntity.toJson(superAdminEntity);
    }

}

export class ResLogin {

    accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

}
