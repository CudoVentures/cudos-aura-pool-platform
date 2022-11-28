import { NOT_EXISTS_INT } from '../../common/utils';
import AdminRepo from '../repos/admin.repo';

export default class AdminEntity {

    adminId: number;
    accountId: number;
    cudosWalletAddress: string;
    bitcoinWalletAddress: string;

    constructor() {
        this.adminId = NOT_EXISTS_INT;
        this.accountId = NOT_EXISTS_INT;
        this.cudosWalletAddress = '';
        this.bitcoinWalletAddress = '';
    }

    static newInstanceForAccount(accountId: number) {
        const entity = new AdminEntity();

        entity.accountId = accountId;

        return entity;
    }

    isNew(): boolean {
        return this.adminId === NOT_EXISTS_INT;
    }

    static toRepo(entity: AdminEntity): any {
        if (entity === null) {
            return null;
        }

        const repoJson = new AdminRepo();

        if (entity.isNew() === false) {
            repoJson.adminId = entity.adminId;
        }
        repoJson.accountId = entity.accountId;
        repoJson.cudosWalletAddress = entity.cudosWalletAddress;
        repoJson.bitcoinWalletAddress = entity.bitcoinWalletAddress;

        return repoJson;
    }

    static fromRepo(repoJson: AdminRepo): AdminEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new AdminEntity();

        entity.adminId = repoJson.adminId ?? entity.adminId;
        entity.accountId = repoJson.accountId ?? entity.accountId;
        entity.cudosWalletAddress = repoJson.cudosWalletAddress ?? entity.cudosWalletAddress;
        entity.bitcoinWalletAddress = repoJson.bitcoinWalletAddress ?? entity.bitcoinWalletAddress;

        return entity;
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

        entity.adminId = parseInt(json.adminId ?? entity.adminId);
        entity.accountId = parseInt(json.accountId ?? entity.accountId);
        entity.cudosWalletAddress = json.cudos_address ?? entity.cudosWalletAddress;
        entity.bitcoinWalletAddress = json.payout_address ?? entity.bitcoinWalletAddress;

        return entity;
    }

}
