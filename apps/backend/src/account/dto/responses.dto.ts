import { AccountJsonValidator } from '../account.types';
import AccountEntity from '../entities/account.entity';

export class ResEditSessionAccount {

    accountEntity: AccountJsonValidator;

    constructor(accountEntity: AccountEntity) {
        this.accountEntity = AccountEntity.toJson(accountEntity);
    }

}
