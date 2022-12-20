import { NOT_EXISTS_INT } from '../../common/utils';
import { SuperAdminJsonValidator } from '../account.types';
import SuperAdminRepo from '../repos/super-admin.repo';

export default class SuperAdminEntity {

    superAdminId: number;
    accountId: number;
    cudosRoyalteesAddress: string;
    firstSaleCudosRoyaltiesPercent: number;
    resaleCudosRoyaltiesPercent: number;
    globalCudosFeesPercent: number;
    globalCudosRoyaltiesPercent: number;

    constructor() {
        this.superAdminId = NOT_EXISTS_INT;
        this.accountId = NOT_EXISTS_INT;
        this.cudosRoyalteesAddress = '';
        this.firstSaleCudosRoyaltiesPercent = 0;
        this.resaleCudosRoyaltiesPercent = 0;
        this.globalCudosFeesPercent = 0;
        this.globalCudosRoyaltiesPercent = 0;
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
        repoJson.firstSaleCudosRoyaltiesPercent = entity.firstSaleCudosRoyaltiesPercent;
        repoJson.resaleCudosRoyaltiesPercent = entity.resaleCudosRoyaltiesPercent;
        repoJson.globalCudosFeesPercent = entity.globalCudosFeesPercent;
        repoJson.globalCudosRoyaltiesPercent = entity.globalCudosRoyaltiesPercent;

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
        entity.firstSaleCudosRoyaltiesPercent = repoJson.firstSaleCudosRoyaltiesPercent ?? entity.firstSaleCudosRoyaltiesPercent;
        entity.resaleCudosRoyaltiesPercent = repoJson.resaleCudosRoyaltiesPercent ?? entity.resaleCudosRoyaltiesPercent;
        entity.globalCudosFeesPercent = repoJson.globalCudosFeesPercent ?? entity.globalCudosFeesPercent;
        entity.globalCudosRoyaltiesPercent = repoJson.globalCudosRoyaltiesPercent ?? entity.globalCudosRoyaltiesPercent;

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
            'firstSaleCudosRoyaltiesPercent': model.firstSaleCudosRoyaltiesPercent,
            'resaleCudosRoyaltiesPercent': model.resaleCudosRoyaltiesPercent,
            'globalCudosFeesPercent': model.globalCudosFeesPercent,
            'globalCudosRoyaltiesPercent': model.globalCudosRoyaltiesPercent,
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
        model.firstSaleCudosRoyaltiesPercent = Number(json.firstSaleCudosRoyaltiesPercent ?? model.firstSaleCudosRoyaltiesPercent);
        model.resaleCudosRoyaltiesPercent = Number(json.resaleCudosRoyaltiesPercent ?? model.resaleCudosRoyaltiesPercent);
        model.globalCudosFeesPercent = Number(json.globalCudosFeesPercent ?? model.globalCudosFeesPercent);
        model.globalCudosRoyaltiesPercent = Number(json.globalCudosRoyaltiesPercent ?? model.globalCudosRoyaltiesPercent);

        return model;
    }

}
