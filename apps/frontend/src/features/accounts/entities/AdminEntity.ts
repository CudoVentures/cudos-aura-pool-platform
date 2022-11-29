import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';

export default class AdminEntity {

    adminId: string;
    accountId: string;
    cudosWalletAddress: string;
    bitcoinWalletAddress: string;

    constructor() {
        this.adminId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.cudosWalletAddress = '';
        this.bitcoinWalletAddress = '';

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.adminId === S.Strings.NOT_EXISTS;
    }

    isBitcointAddressConfirmed(): boolean {
        return this.bitcoinWalletAddress !== '';
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
            'adminId': entity.adminId,
            'accountId': entity.accountId,
            'cudosWalletAddress': entity.cudosWalletAddress,
            'bitcoinWalletAddress': entity.bitcoinWalletAddress,
        }
    }

    static fromJson(json: any) {
        if (json === null) {
            return null;
        }

        const entity = new AdminEntity();

        entity.adminId = (json.adminId ?? entity.adminId).toString();
        entity.accountId = (json.accountId ?? entity.accountId).toString();
        entity.cudosWalletAddress = json.cudosWalletAddress ?? entity.cudosWalletAddress;
        entity.bitcoinWalletAddress = json.bitcoinWalletAddress ?? entity.bitcoinWalletAddress;

        return entity;
    }

}
