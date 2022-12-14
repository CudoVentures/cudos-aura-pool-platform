import { AccountJsonValidator, SuperAdminJsonValidator } from '../account.types';
import AccountEntity from '../entities/account.entity';
import SuperAdminEntity from '../entities/super-admin.entity';

export class ResEditSessionAccount {

    accountEntity: AccountJsonValidator;

    constructor(accountEntity: AccountEntity) {
        this.accountEntity = AccountEntity.toJson(accountEntity);
    }

}

export class ResEditSuperAdminAccount {

    superAdminEntity: SuperAdminJsonValidator;

    constructor(superAdminEntity: SuperAdminEntity) {
        this.superAdminEntity = SuperAdminEntity.toJson(superAdminEntity);
    }
}
