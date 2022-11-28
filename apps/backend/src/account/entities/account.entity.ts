import { IntBoolValue, NOT_EXISTS_INT } from '../../common/utils';
import { AccountType } from '../account.types';
import AccountRepo from '../repos/account.repo';

export default class AccountEntity {

    accountId: number;
    type: AccountType;
    active: IntBoolValue;
    emailVerified: IntBoolValue;
    name: string;
    email: string;
    timestampLastLogin: number;
    timestampRegister: number;
    salt: string;
    hashedPass: string;

    constructor() {
        this.accountId = NOT_EXISTS_INT;
        this.type = AccountType.USER;
        this.active = IntBoolValue.TRUE;
        this.emailVerified = IntBoolValue.TRUE;
        this.name = '';
        this.email = '';
        this.timestampLastLogin = NOT_EXISTS_INT;
        this.timestampRegister = NOT_EXISTS_INT;
        this.salt = '';
        this.hashedPass = '';
    }

    static newInstanceAdmin(): AccountEntity {
        const entity = new AccountEntity();

        entity.type = AccountType.ADMIN;

        return entity;
    }

    isNew(): boolean {
        return this.accountId === NOT_EXISTS_INT;
    }

    isUser(): boolean {
        return this.type === AccountType.USER;
    }

    isAdmin(): boolean {
        return this.type === AccountType.ADMIN;
    }

    isSuperAdmin(): boolean {
        return this.type === AccountType.SUPER_ADMIN;
    }

    isEmailVerified(): boolean {
        return this.emailVerified === IntBoolValue.TRUE;
    }

    static toRepo(entity: AccountEntity): any {
        if (entity === null) {
            return null;
        }

        const repoJson = new AccountRepo();

        if (entity.isNew() === false) {
            repoJson.accountId = entity.accountId;
        }
        repoJson.type = entity.type;
        repoJson.active = entity.active;
        repoJson.emailVerified = entity.emailVerified;
        repoJson.name = entity.name;
        repoJson.email = entity.email;
        repoJson.lastLoginAt = new Date(entity.timestampLastLogin);
        repoJson.salt = entity.salt;
        repoJson.hashedPass = entity.hashedPass;

        return repoJson;
    }

    static fromRepo(repoJson: AccountRepo): AccountEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new AccountEntity();

        entity.accountId = repoJson.accountId ?? entity.accountId;
        entity.type = repoJson.type ?? entity.type;
        entity.active = repoJson.active ?? entity.active;
        entity.emailVerified = repoJson.emailVerified ?? entity.emailVerified;
        entity.name = repoJson.name ?? entity.name;
        entity.email = repoJson.email ?? entity.email;
        entity.timestampLastLogin = repoJson?.lastLoginAt?.getTime() ?? NOT_EXISTS_INT;
        entity.timestampRegister = repoJson?.createdAt?.getTime() ?? NOT_EXISTS_INT;
        entity.salt = repoJson.salt ?? entity.salt;
        entity.hashedPass = repoJson.hashedPass ?? entity.hashedPass;

        return entity;
    }

    static toJson(entity: AccountEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'accountId': entity.accountId,
            'type': entity.type,
            'active': entity.active,
            'emailVerified': entity.emailVerified,
            'name': entity.name,
            'email': entity.email,
            'timestamp_last_login': entity.timestampLastLogin,
            'timestamp_register': entity.timestampRegister,
        }
    }

    static fromJson(json): AccountEntity {
        if (json === null) {
            return null;
        }

        const entity = new AccountEntity();

        entity.accountId = parseInt(json.accountId ?? entity.accountId);
        entity.type = parseInt(json.type ?? entity.type);
        entity.active = parseInt(json.active ?? entity.active);
        entity.emailVerified = parseInt(json.emailVerified ?? entity.emailVerified);
        entity.name = json.name ?? entity.name;
        entity.email = json.email ?? entity.email;
        entity.timestampLastLogin = parseInt(json.timestampLastLogin ?? entity.timestampLastLogin);
        entity.timestampRegister = parseInt(json.timestampRegister ?? entity.timestampRegister);

        return entity;
    }

}
