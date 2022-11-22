import S from '../../../core/utilities/Main';
import { makeAutoObservable } from 'mobx';

export default class SuperAdminEntity {

    superAdminId: string;
    accountId: string;
    cudosRoyalteesAddress: string;
    firstSaleCudosRoyaltiesPercent: number;
    resaleCudosRoyaltiesPercent: number;
    globalCudosFeesPercent: number;
    globalCudosRoyaltiesPercent: number;

    constructor() {
        this.superAdminId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.cudosRoyalteesAddress = '';
        this.firstSaleCudosRoyaltiesPercent = S.NOT_EXISTS
        this.resaleCudosRoyaltiesPercent = S.NOT_EXISTS
        this.globalCudosFeesPercent = S.NOT_EXISTS
        this.globalCudosRoyaltiesPercent = S.NOT_EXISTS

        // TODO: REMOVE HARDCODED VALUES
        this.cudosRoyalteesAddress = 'cudos14h7pdf8g2kkjgum5dntz80s5lhtrw3lk2uswk0';
        this.firstSaleCudosRoyaltiesPercent = 2
        this.resaleCudosRoyaltiesPercent = 2.5
        this.globalCudosFeesPercent = 10
        this.globalCudosRoyaltiesPercent = 5

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.superAdminId === S.Strings.NOT_EXISTS;
    }

    static toJson(model: SuperAdminEntity) {
        return {
            'super_admin_id': parseInt(model.superAdminId),
            'account_id': parseInt(model.accountId),
            'cudosRoyalteesAddress': model.cudosRoyalteesAddress,
            'firstSaleCudosRoyaltiesPercent': model.firstSaleCudosRoyaltiesPercent,
            'resaleCudosRoyaltiesPercent': model.resaleCudosRoyaltiesPercent,
            'globalCudosFeesPercent': model.globalCudosFeesPercent,
            'globalCudosRoyaltiesPercent': model.globalCudosRoyaltiesPercent,
        }
    }

    static fromJson(json: any) {
        if (json === null) {
            return null;
        }

        const model = new SuperAdminEntity();

        model.superAdminId = (json.super_admin_id ?? model.superAdminId).toString();
        model.accountId = (json.account_id ?? model.accountId).toString();
        model.cudosRoyalteesAddress = json.cudosRoyalteesAddress ?? model.cudosRoyalteesAddress;
        model.firstSaleCudosRoyaltiesPercent = Number(json.firstSaleCudosRoyaltiesPercent ?? model.firstSaleCudosRoyaltiesPercent);
        model.resaleCudosRoyaltiesPercent = Number(json.resaleCudosRoyaltiesPercent ?? model.resaleCudosRoyaltiesPercent);
        model.globalCudosFeesPercent = Number(json.globalCudosFeesPercent ?? model.globalCudosFeesPercent);
        model.globalCudosRoyaltiesPercent = Number(json.globalCudosRoyaltiesPercent ?? model.globalCudosRoyaltiesPercent);

        return model;
    }

}
