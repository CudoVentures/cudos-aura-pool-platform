import { NOT_EXISTS_INT } from '../../common/utils';
import { SuperAdminJsonValidator } from '../account.types';
import SuperAdminRepo from '../repos/super-admin.repo';

export default class SuperAdminEntity {

    superAdminId: number;
    accountId: number;
    cudosRoyalteesAddress: string;

    constructor() {
        this.superAdminId = NOT_EXISTS_INT;
        this.accountId = NOT_EXISTS_INT;
        this.cudosRoyalteesAddress = '';
    }

    isNew(): boolean {
        return this.superAdminId === NOT_EXISTS_INT;
    }

    static toRepo(entity: SuperAdminEntity): any {
        if (entity === null) {
            return null;
        }

        const repoJson = new SuperAdminRepo();

        if (entity.isNew() === false) {
            repoJson.superAdminId = entity.superAdminId;
        }
        repoJson.accountId = entity.accountId;
        repoJson.cudosRoyalteesAddress = entity.cudosRoyalteesAddress;

        return repoJson;
    }

    static fromRepo(repoJson: SuperAdminRepo): SuperAdminEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new SuperAdminEntity();

        entity.superAdminId = repoJson.superAdminId ?? entity.superAdminId;
        entity.accountId = repoJson.accountId ?? entity.accountId;
        entity.cudosRoyalteesAddress = repoJson.cudosRoyalteesAddress ?? entity.cudosRoyalteesAddress;

        return entity;
    }

    static toJson(model: SuperAdminEntity): SuperAdminJsonValidator {
        if (model === null) {
            return null;
        }

        return {
            'superAdminId': model.superAdminId.toString(),
            'accountId': model.accountId.toString(),
            'cudosRoyalteesAddress': model.cudosRoyalteesAddress,
        }
    }

    static fromJson(json: SuperAdminJsonValidator) {
        if (json === null) {
            return null;
        }

        const model = new SuperAdminEntity();

        model.superAdminId = parseInt(json.superAdminId ?? model.superAdminId.toString());
        model.accountId = parseInt(json.accountId ?? model.accountId.toString());
        model.cudosRoyalteesAddress = json.cudosRoyalteesAddress ?? model.cudosRoyalteesAddress;

        return model;
    }

}
