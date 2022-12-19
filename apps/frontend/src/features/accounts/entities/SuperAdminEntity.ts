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
        this.firstSaleCudosRoyaltiesPercent = S.NOT_EXISTS;
        this.resaleCudosRoyaltiesPercent = S.NOT_EXISTS;
        this.globalCudosFeesPercent = S.NOT_EXISTS;
        this.globalCudosRoyaltiesPercent = S.NOT_EXISTS;

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

        model.superAdminId = (json.superAdminId ?? model.superAdminId).toString();
        model.accountId = (json.accountId ?? model.accountId).toString();
        model.cudosRoyalteesAddress = json.cudosRoyalteesAddress ?? model.cudosRoyalteesAddress;
        model.firstSaleCudosRoyaltiesPercent = Number(json.firstSaleCudosRoyaltiesPercent ?? model.firstSaleCudosRoyaltiesPercent);
        model.resaleCudosRoyaltiesPercent = Number(json.resaleCudosRoyaltiesPercent ?? model.resaleCudosRoyaltiesPercent);
        model.globalCudosFeesPercent = Number(json.globalCudosFeesPercent ?? model.globalCudosFeesPercent);
        model.globalCudosRoyaltiesPercent = Number(json.globalCudosRoyaltiesPercent ?? model.globalCudosRoyaltiesPercent);

        return model;
    }

}
