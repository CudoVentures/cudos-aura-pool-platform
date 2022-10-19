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

    static toJson(model: SuperAdminEntity) {
        return {
            'superAdminId': model.superAdminId,
            'accountId': model.accountId,
        }
    }

    static fromJson(json: any) {
        if (json === null) {
            return null;
        }

        const model = new SuperAdminEntity();

        model.superAdminId = (json.superAdminId ?? model.superAdminId).toString();
        model.accountId = (json.accountId ?? model.accountId).toString();

        return model;
    }

}
