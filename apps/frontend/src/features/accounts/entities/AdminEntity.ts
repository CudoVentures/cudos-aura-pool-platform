import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';

export default class AdminEntity {

    adminId: string;
    accountId: string;
    cudosWalletAddress: string;

    constructor() {
        this.adminId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.cudosWalletAddress = '';

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.adminId === S.Strings.NOT_EXISTS;
    }

    clone(): AdminEntity {
        const accountEntity = Object.assign(new AdminEntity(), this);

        return accountEntity;
    }

    static toJson(entity: AdminEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'id': parseInt(entity.adminId),
            'account_id': parseInt(entity.accountId),
            'cudos_address': entity.cudosWalletAddress,
        }
    }

    static fromJson(json: any) {
        if (json === null) {
            return null;
        }

        const entity = new AdminEntity();

        entity.adminId = (json.admin_id ?? entity.adminId).toString();
        entity.accountId = (json.account_id ?? entity.accountId).toString();
        entity.cudosWalletAddress = (json.cudos_address ?? entity.cudosWalletAddress).toString();

        return entity;
    }

}
