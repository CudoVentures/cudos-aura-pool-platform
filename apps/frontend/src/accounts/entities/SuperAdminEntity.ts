import S from '../../core/utilities/Main';
import { makeAutoObservable } from 'mobx';

export default class SuperAdminEntity {

    superAdminId: string;
    accountId: string;
    cudosRoyalteesAddress: string;

    constructor() {
        this.superAdminId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.cudosRoyalteesAddress = '';

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.superAdminId === S.Strings.NOT_EXISTS;
    }

    clone(): SuperAdminEntity {
        return Object.assign(new SuperAdminEntity(), this);
    }

    copy(source: SuperAdminEntity) {
        Object.assign(this, source);
    }

    static toJson(model: SuperAdminEntity): any {
        if (model === null) {
            return null;
        }

        return {
            'superAdminId': model.superAdminId,
            'accountId': model.accountId,
            'cudosRoyalteesAddress': model.cudosRoyalteesAddress,
        }
    }

    static fromJson(json: any) {
        if (json === null) {
            return null;
        }

        const model = new SuperAdminEntity();

        model.superAdminId = (json.superAdminId ?? model.superAdminId).toString();
        model.accountId = (json.accountId ?? model.accountId).toString();
        model.cudosRoyalteesAddress = json.cudosRoyalteesAddress ?? model.cudosRoyalteesAddress;

        return model;
    }

}
