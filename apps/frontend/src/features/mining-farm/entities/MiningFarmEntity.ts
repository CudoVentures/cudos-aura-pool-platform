import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import numeral from 'numeral';
import S from '../../../core/utilities/Main';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

export enum MiningFarmStatus {
    APPROVED = 1,
    NOT_APPROVED = 2,
    DELETED = 3,
    ANY = 4
}

export default class MiningFarmEntity {

    id: string;
    accountId: string;
    name: string;
    legalName: string;
    primaryAccountOwnerName: string;
    primaryAccountOwnerEmail: string;
    description: string;
    manufacturerIds: string[];
    minerIds: string[];
    energySourceIds: string[];
    hashPowerInTh: number;
    machinesLocation: string
    profileImgUrl: string;
    coverImgUrl: string;
    farmPhotoUrls: string[];
    status: MiningFarmStatus;
    maintenanceFeeInBtc: BigNumber;
    powerCost: number;
    poolFee: number;
    powerConsumptionPerTh: number;

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.name = S.Strings.EMPTY;
        this.legalName = S.Strings.EMPTY;
        this.primaryAccountOwnerName = S.Strings.EMPTY;
        this.primaryAccountOwnerEmail = S.Strings.EMPTY;
        this.description = S.Strings.EMPTY;
        this.manufacturerIds = [];
        this.minerIds = [];
        this.energySourceIds = [];
        this.hashPowerInTh = S.NOT_EXISTS;
        this.machinesLocation = S.Strings.EMPTY;
        this.profileImgUrl = '/assets/temp/profile-preview.png';
        this.coverImgUrl = '/assets/temp/profile-cover.png';
        this.farmPhotoUrls = [];
        this.status = MiningFarmStatus.NOT_APPROVED;
        this.maintenanceFeeInBtc = null;
        this.powerCost = S.NOT_EXISTS;
        this.poolFee = S.NOT_EXISTS;
        this.powerConsumptionPerTh = S.NOT_EXISTS;

        makeAutoObservable(this);
    }

    static newInstanceWithEmail(primaryAccountOwnerEmail: string) {
        const entity = new MiningFarmEntity();
        entity.primaryAccountOwnerEmail = primaryAccountOwnerEmail;
        return entity;
    }

    isNew(): boolean {
        return this.id === S.Strings.NOT_EXISTS;
    }

    isApproved(): boolean {
        return this.status === MiningFarmStatus.APPROVED;
    }

    hasPhotos(): boolean {
        return this.farmPhotoUrls.length > 0;
    }

    markApproved() {
        this.status = MiningFarmStatus.APPROVED;
    }

    formatHashPowerInTh(): string {
        return `${this.hashPowerInTh !== S.NOT_EXISTS ? this.hashPowerInTh : 0} TH`
    }

    formatMaintenanceFeesInBtc(): string {
        return `${this.maintenanceFeeInBtc !== null ? this.maintenanceFeeInBtc.toFixed(5) : '0.00'} BTC`;
    }

    formatPowerCost(): string {
        const powerCost = `${this.powerCost !== S.NOT_EXISTS ? this.powerCost : 0}`
        return numeral(powerCost).format(ProjectUtils.NUMERAL_USD);
    }

    formatPoolFee(): string {
        return `${this.poolFee !== S.NOT_EXISTS ? this.poolFee : 0} %`;
    }

    formatPowerConsumptionPerTH(): string {
        return `${this.powerConsumptionPerTh !== S.NOT_EXISTS ? this.powerConsumptionPerTh : 0} W`;
    }

    static toJson(entity: MiningFarmEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'id': entity.id,
            'accountId': entity.accountId,
            'name': entity.name,
            'legalName': entity.legalName,
            'primaryAccountOwnerName': entity.primaryAccountOwnerName,
            'primaryAccountOwnerEmail': entity.primaryAccountOwnerEmail,
            'description': entity.description,
            'manufacturerIds': entity.manufacturerIds,
            'minerIds': entity.minerIds,
            'energySourceIds': entity.energySourceIds,
            'hashPowerInTh': entity.hashPowerInTh,
            'machinesLocation': entity.machinesLocation,
            'profileImgUrl': entity.profileImgUrl,
            'coverImgUrl': entity.coverImgUrl,
            'farmPhotoUrls': JSON.stringify(entity.farmPhotoUrls),
            'status': entity.status,
            'maintenanceFeeInBtc': entity.maintenanceFeeInBtc.toString(),
            'powerCost': entity.powerCost,
            'poolFee': entity.poolFee,
            'powerConsumptionPerTh': entity.powerConsumptionPerTh,
        }
    }

    static fromJson(json): MiningFarmEntity {
        if (json === null) {
            return null;
        }
        const model = new MiningFarmEntity();

        model.id = json.id ?? model.id;
        model.accountId = json.accountId ?? model.accountId;
        model.name = json.name ?? model.name;
        model.legalName = json.legalName ?? model.legalName;
        model.primaryAccountOwnerName = json.primaryAccountOwnerName ?? model.primaryAccountOwnerName;
        model.primaryAccountOwnerEmail = json.primaryAccountOwnerEmail ?? model.primaryAccountOwnerEmail;
        model.description = json.description ?? model.description;
        model.manufacturerIds = json.manufacturerIds ?? model.manufacturerIds;
        model.minerIds = json.minerIds ?? model.minerIds;
        model.energySourceIds = json.energySourceIds ?? model.energySourceIds;
        model.hashPowerInTh = Number(json.hashPowerInTh) ?? model.hashPowerInTh;
        model.machinesLocation = json.machinesLocation ?? model.machinesLocation;
        model.profileImgUrl = json.profileImgUrl ?? model.profileImgUrl;
        model.coverImgUrl = json.coverImgUrl ?? model.coverImgUrl;
        model.farmPhotoUrls = JSON.parse(json.farmPhotoUrls ?? model.farmPhotoUrls);
        model.status = parseInt(json.status ?? model.status);
        model.maintenanceFeeInBtc = new BigNumber(json.maintenanceFeeInBtc ?? model.maintenanceFeeInBtc);
        model.powerCost = Number(json.powerCost) ?? model.powerCost;
        model.poolFee = Number(json.poolFee) ?? model.poolFee;
        model.powerConsumptionPerTh = Number(json.powerConsumptionPerTh) ?? model.powerConsumptionPerTh;

        return model;
    }

}
