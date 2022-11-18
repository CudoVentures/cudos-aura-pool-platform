import S from '../../../core/utilities/Main';
import { makeAutoObservable } from 'mobx';

export default class SuperAdminEntity {

    superAdminId: string;
    accountId: string;

    constructor() {
        this.superAdminId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.superAdminId === S.Strings.NOT_EXISTS;
    }

    static toJson(model: SuperAdminEntity) {
        return {
            'super_admin_id': parseInt(model.superAdminId),
            'account_id': parseInt(model.accountId),
        }
    }

    static fromJson(json: any) {
        if (json === null) {
            return null;
        }

        const model = new SuperAdminEntity();

        model.superAdminId = (json.super_admin_id ?? model.superAdminId).toString();
        model.accountId = (json.account_id ?? model.accountId).toString();

        return model;
    }

}
