import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';

export enum MiningFarmStatus {
    APPROVED = 1,
    NOT_APPROVED = 2,
    DELETED = 3,
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
    hashRateTh: number;
    powerCost: number;
    machinesLocation: string
    poolFee: number;
    powerConsumptionPerTh: number;
    profileImgUrl: string;
    coverImgUrl: string;
    farmPhotoUrls: string[];
    status: MiningFarmStatus;

    constructor() {
        this.id = S.Strings.EMPTY;
        this.accountId = S.Strings.EMPTY;
        this.name = S.Strings.EMPTY;
        this.legalName = S.Strings.EMPTY;
        this.primaryAccountOwnerName = S.Strings.EMPTY;
        this.primaryAccountOwnerEmail = S.Strings.EMPTY;
        this.description = S.Strings.EMPTY;
        this.manufacturerIds = [];
        this.minerIds = [];
        this.energySourceIds = [];
        this.hashRateTh = S.NOT_EXISTS;
        this.powerCost = S.NOT_EXISTS;
        this.machinesLocation = S.Strings.EMPTY;
        this.poolFee = S.NOT_EXISTS;
        this.powerConsumptionPerTh = S.NOT_EXISTS;
        this.profileImgUrl = '/assets/temp/profile-preview.png';
        this.coverImgUrl = '/assets/temp/profile-cover.png';
        this.farmPhotoUrls = [];
        this.status = MiningFarmStatus.NOT_APPROVED;

        makeAutoObservable(this);
    }

    isNew(): boolean {
        return this.id === S.Strings.EMPTY;
    }

    isApproved(): boolean {
        return this.status === MiningFarmStatus.APPROVED;
    }

    markApproved() {
        this.status = MiningFarmStatus.APPROVED;
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
            'hashRateTh': entity.hashRateTh,
            'powerCost': entity.powerCost,
            'machinesLocation': entity.machinesLocation,
            'poolFee': entity.poolFee,
            'powerConsumptionPerTh': entity.powerConsumptionPerTh,
            'profileImgUrl': entity.profileImgUrl,
            'coverImgUrl': entity.coverImgUrl,
            'farmPhotoUrls': JSON.stringify(entity.farmPhotoUrls),
            'status': entity.status,
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
        model.hashRateTh = Number(json.hashRateTh) ?? model.hashRateTh;
        model.powerCost = Number(json.powerCost) ?? model.powerCost;
        model.machinesLocation = json.machinesLocation ?? model.machinesLocation;
        model.poolFee = Number(json.poolFee) ?? model.poolFee;
        model.powerConsumptionPerTh = Number(json.powerConsumptionPerTh) ?? model.powerConsumptionPerTh;
        model.profileImgUrl = json.profileImgUrl ?? model.profileImgUrl;
        model.coverImgUrl = json.coverImgUrl ?? model.coverImgUrl;
        model.farmPhotoUrls = json.farmPhotoUrls ?? model.farmPhotoUrls;
        model.status = parseInt(json.status ?? model.status);

        return model;
    }

    // TODO: do a good parsing
    parseHashRateFromString(hashRateString: string) {
        const [hashRate, unit] = hashRateString.split(' ');
        const hashRateParsed = Number(hashRate);
        if (unit !== undefined) {
            switch (unit.toLowerCase()) {
                case 'eh/s':
                    this.hashRateTh = hashRateParsed * 1000000;
                    return;
                case 'ph/s':
                    this.hashRateTh = hashRateParsed * 1000;
                    return;
                case 'th/s':
                    this.hashRateTh = hashRateParsed;
                    return;
                default:
                    this.hashRateTh = S.NOT_EXISTS;
            }
        }

        this.hashRateTh = hashRateParsed;
    }

    displayHashRate(): string {
        if (this.hashRateTh < 1000) {
            return `${this.hashRateTh} TH/s`;
        }

        if (this.hashRateTh / 1000 < 1000) {
            return `${(this.hashRateTh / 1000).toFixed(2)} PH/s`;
        }

        if (this.hashRateTh / 1000000 < 1000) {
            return `${(this.hashRateTh / 1000000).toFixed(2)} EH/s`;
        }

        return S.Strings.EMPTY;
    }

}
