import { makeAutoObservable } from 'mobx';
import moment from 'moment';

import S from '../../../core/utilities/Main';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

export enum AccountType {
    USER = 1,
    ADMIN = 2,
    SUPER_ADMIN = 3,
}

export default class AccountEntity {

    accountId: string;
    type: AccountType;
    active: number;
    emailVerified: number;
    name: string;
    email: string;
    timestampLastLogin: number;
    timestampRegister: number;

    constructor() {
        this.accountId = '';
        this.type = AccountType.USER;
        this.active = S.INT_TRUE;
        this.emailVerified = S.INT_FALSE;
        this.name = '';
        this.email = '';
        this.timestampLastLogin = -1;
        this.timestampRegister = -1;

        makeAutoObservable(this);
    }

    deepClone(): AccountEntity {
        const accountEntity = Object.assign(new AccountEntity(), this);
        accountEntity.type = this.type;

        return accountEntity;
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
        return this.emailVerified === S.INT_TRUE;
    }

    formatDateJoined(): string {
        return moment(new Date(this.timestampRegister)).format(ProjectUtils.MOMENT_FORMAT_DATE);
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
            'timestampLastLogin': entity.timestampLastLogin,
            'timestampRegister': entity.timestampRegister,
        }
    }

    static fromJson(json): AccountEntity {
        if (json === null) {
            return null;
        }

        const entity = new AccountEntity();

        entity.accountId = (json.accountId ?? entity.accountId).toString();
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
