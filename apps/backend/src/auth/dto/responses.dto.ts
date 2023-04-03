import AccountEntity from '../../account/entities/account.entity';
import AdminEntity from '../../account/entities/admin.entity';
import SuperAdminEntity from '../../account/entities/super-admin.entity';
import UserEntity from '../../account/entities/user.entity';
import { IntBoolValue } from '../../common/utils';

export class ResFetchSessionAccounts {
    accessToken: string;
    accountEntity: any;
    userEntity: any;
    adminEntity: any;
    superAdminEntity: any;
    shouldChangePassword: IntBoolValue;

    constructor(accessToken, accountEntity: AccountEntity, userEntity: UserEntity, adminEntity: AdminEntity, superAdminEntity: SuperAdminEntity, shouldChangePassword: IntBoolValue) {
        this.accessToken = accessToken;
        this.accountEntity = AccountEntity.toJson(accountEntity);
        this.userEntity = UserEntity.toJson(userEntity);
        this.adminEntity = AdminEntity.toJson(adminEntity);
        this.superAdminEntity = SuperAdminEntity.toJson(superAdminEntity);
        this.shouldChangePassword = shouldChangePassword;
    }

}

export class ResLogin {

    accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

}
