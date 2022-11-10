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

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.name = '';
        this.legalName = '';
        this.primaryAccountOwnerName = '';
        this.primaryAccountOwnerEmail = '';
        this.description = '';
        this.manufacturerIds = [];
        this.minerIds = [];
        this.energySourceIds = [];
        this.hashPowerInTh = S.NOT_EXISTS;
        this.machinesLocation = '';
        this.profileImgUrl = '/assets/temp/profile-preview.png';
        this.coverImgUrl = '/assets/temp/profile-cover.png';
        this.farmPhotoUrls = [];
        this.status = MiningFarmStatus.NOT_APPROVED;
        this.maintenanceFeeInBtc = null;

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

    static toJson(entity: MiningFarmEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'id': entity.id,
            'creator_id': entity.accountId,
            'name': entity.name,
            'sub_account_name': entity.legalName,
            'primary_account_owner_name': entity.primaryAccountOwnerName,
            'primary_account_owner_email': entity.primaryAccountOwnerEmail,
            'description': entity.description,
            'manufacturer_ids': JSON.stringify(entity.manufacturerIds),
            'miner_ids': JSON.stringify(entity.minerIds),
            'energy_source_ids': JSON.stringify(entity.energySourceIds),
            'total_farm_hashrate': entity.hashPowerInTh,
            'location': entity.machinesLocation,
            'profile_img': entity.profileImgUrl,
            'cover_img': entity.coverImgUrl,
            'farm_photos': JSON.stringify(entity.farmPhotoUrls),
            'status': entity.status,
            'maintenance_fee_in_btc': entity.maintenanceFeeInBtc.toString(),
        }
    }

    static fromJson(json): MiningFarmEntity {
        if (json === null) {
            return null;
        }
        const model = new MiningFarmEntity();

        model.id = (json.id ?? model.id).toString();
        model.accountId = (json.creator_id ?? model.accountId).toString();
        model.name = json.name ?? model.name;
        model.legalName = json.sub_account_name ?? model.legalName;
        model.primaryAccountOwnerName = json.primary_account_owner_name ?? model.primaryAccountOwnerName;
        model.primaryAccountOwnerEmail = json.primary_account_owner_email ?? model.primaryAccountOwnerEmail;
        model.description = json.description ?? model.description;
        model.manufacturerIds = json.manufacturer_ids ?? model.manufacturerIds;
        model.minerIds = json.miner_ids ?? model.minerIds;
        model.energySourceIds = json.energy_source_ids ?? model.energySourceIds;
        model.hashPowerInTh = Number(json.total_farm_hashrate ?? model.hashPowerInTh);
        model.machinesLocation = json.location ?? model.machinesLocation;
        model.profileImgUrl = json.profile_img ?? model.profileImgUrl;
        model.coverImgUrl = json.cover_img ?? model.coverImgUrl;
        model.farmPhotoUrls = json.farm_photos ?? model.farmPhotoUrls;
        model.status = parseInt(json.status ?? model.status);
        model.maintenanceFeeInBtc = new BigNumber(json.maintenance_fee_in_btc ?? model.maintenanceFeeInBtc);

        return model;
    }

}
