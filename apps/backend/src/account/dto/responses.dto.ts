import { AccountJsonValidator, SuperAdminJsonValidator } from '../account.types';
import AccountEntity from '../entities/account.entity';
import AdminEntity from '../entities/admin.entity';
import SuperAdminEntity from '../entities/super-admin.entity';

export class ResEditSessionAccount {

    accountEntity: AccountJsonValidator;

    constructor(accountEntity: AccountEntity) {
        this.accountEntity = AccountEntity.toJson(accountEntity);
    }

}

export class ResEditSessionSuperAdmin {

    superAdminEntity: SuperAdminJsonValidator;

    constructor(superAdminEntity: SuperAdminEntity) {
        this.superAdminEntity = SuperAdminEntity.toJson(superAdminEntity);
    }
}

export class ResFetchFarmOwnerAccount {

    adminEntity: any;

    constructor(adminEntity: AdminEntity) {
        this.adminEntity = AdminEntity.toJson(adminEntity);
    }

}
