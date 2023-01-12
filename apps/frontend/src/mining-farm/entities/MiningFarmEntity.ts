import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';

export enum MiningFarmStatus {
    APPROVED = 'approved',
    QUEUED = 'queued',
    REJECTED = 'rejected',
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

    // royalties paid to cudos percents
    cudosMintNftRoyaltiesPercent: number;
    cudosResaleNftRoyaltiesPercent: number;

    // ADRESSES
    resaleFarmRoyaltiesCudosAddress: string;
    rewardsFromPoolBtcAddress: string;
    leftoverRewardsBtcAddress: string;
    maintenanceFeePayoutBtcAddress: string;

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
        this.status = MiningFarmStatus.QUEUED;
        this.maintenanceFeeInBtc = null;
        this.cudosMintNftRoyaltiesPercent = S.NOT_EXISTS;
        this.cudosResaleNftRoyaltiesPercent = S.NOT_EXISTS;
        this.resaleFarmRoyaltiesCudosAddress = '';
        this.rewardsFromPoolBtcAddress = '';
        this.leftoverRewardsBtcAddress = '';
        this.maintenanceFeePayoutBtcAddress = '';

        makeAutoObservable(this);
    }

    static newInstanceWithEmail(primaryAccountOwnerEmail: string) {
        const entity = new MiningFarmEntity();
        entity.primaryAccountOwnerEmail = primaryAccountOwnerEmail;
        return entity;
    }
    isCudosMintNftRoyaltiesPercentSet(): boolean {
        return this.cudosMintNftRoyaltiesPercent !== S.NOT_EXISTS;
    }

    isCudosResaleNftRoyaltiesPercentSet(): boolean {
        return this.cudosResaleNftRoyaltiesPercent !== S.NOT_EXISTS;
    }

    isNew(): boolean {
        return this.id === S.Strings.NOT_EXISTS;
    }

    isApproved(): boolean {
        return this.status === MiningFarmStatus.APPROVED;
    }

    isQueued(): boolean {
        return this.status === MiningFarmStatus.QUEUED;
    }

    isRejected(): boolean {
        return this.status === MiningFarmStatus.REJECTED;
    }

    hasPhotos(): boolean {
        return this.farmPhotoUrls.length > 0;
    }

    markApproved() {
        this.status = MiningFarmStatus.APPROVED;
    }

    marKRejected() {
        this.status = MiningFarmStatus.REJECTED;
    }

    getMaintenanceFeePerThInBtc(): BigNumber {
        if (this.hashPowerInTh === S.NOT_EXISTS || this.maintenanceFeeInBtc === null) {
            return new BigNumber(0);
        }

        return this.maintenanceFeeInBtc.dividedBy(new BigNumber(this.hashPowerInTh));
    }

    formatHashPowerInTh(): string {
        return `${this.hashPowerInTh !== S.NOT_EXISTS ? this.hashPowerInTh : 0} TH/s`
    }

    formatMaintenanceFeesInBtc(): string {
        return `${this.maintenanceFeeInBtc !== null ? this.maintenanceFeeInBtc.toFixed(5) : '0.00'} BTC`;
    }

    clone(): MiningFarmEntity {
        return Object.assign(new MiningFarmEntity(), this);
    }

    copy(source: MiningFarmEntity) {
        Object.assign(this, source);
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
            'farmPhotoUrls': entity.farmPhotoUrls,
            'status': entity.status,
            'maintenanceFeeInBtc': entity.maintenanceFeeInBtc.toString(),
            'cudosMintNftRoyaltiesPercent': entity.cudosMintNftRoyaltiesPercent,
            'cudosResaleNftRoyaltiesPercent': entity.cudosResaleNftRoyaltiesPercent,
            'resaleFarmRoyaltiesCudosAddress': entity.resaleFarmRoyaltiesCudosAddress,
            'rewardsFromPoolBtcAddress': entity.rewardsFromPoolBtcAddress,
            'leftoverRewardsBtcAddress': entity.leftoverRewardsBtcAddress,
            'maintenanceFeePayoutBtcAddress': entity.maintenanceFeePayoutBtcAddress,
        }
    }

    static fromJson(json): MiningFarmEntity {
        if (json === null) {
            return null;
        }
        const entity = new MiningFarmEntity();

        entity.id = (json.id ?? entity.id).toString();
        entity.accountId = (json.accountId ?? entity.accountId).toString();
        entity.name = json.name ?? entity.name;
        entity.legalName = json.legalName ?? entity.legalName;
        entity.primaryAccountOwnerName = json.primaryAccountOwnerName ?? entity.primaryAccountOwnerName;
        entity.primaryAccountOwnerEmail = json.primaryAccountOwnerEmail ?? entity.primaryAccountOwnerEmail;
        entity.description = json.description ?? entity.description;
        entity.manufacturerIds = json.manufacturerIds ?? entity.manufacturerIds;
        entity.minerIds = json.minerIds ?? entity.minerIds;
        entity.energySourceIds = json.energySourceIds ?? entity.energySourceIds;
        entity.hashPowerInTh = Number(json.hashPowerInTh ?? entity.hashPowerInTh);
        entity.machinesLocation = json.machinesLocation ?? entity.machinesLocation;
        entity.profileImgUrl = json.profileImgUrl ?? entity.profileImgUrl;
        entity.coverImgUrl = json.coverImgUrl ?? entity.coverImgUrl;
        entity.farmPhotoUrls = json.farmPhotoUrls ?? entity.farmPhotoUrls;
        entity.status = json.status ?? entity.status;
        entity.maintenanceFeeInBtc = json.maintenanceFeeInBtc === null ? null : new BigNumber(json.maintenanceFeeInBtc);
        entity.cudosMintNftRoyaltiesPercent = Number(json.cudosMintNftRoyaltiesPercent ?? entity.cudosMintNftRoyaltiesPercent);
        entity.cudosResaleNftRoyaltiesPercent = Number(json.cudosResaleNftRoyaltiesPercent ?? entity.cudosResaleNftRoyaltiesPercent);
        entity.resaleFarmRoyaltiesCudosAddress = json.resaleFarmRoyaltiesCudosAddress ?? entity.resaleFarmRoyaltiesCudosAddress;
        entity.rewardsFromPoolBtcAddress = json.rewardsFromPoolBtcAddress ?? entity.rewardsFromPoolBtcAddress;
        entity.leftoverRewardsBtcAddress = json.leftoverRewardsBtcAddress ?? entity.leftoverRewardsBtcAddress;
        entity.maintenanceFeePayoutBtcAddress = json.maintenanceFeePayoutBtcAddress ?? entity.maintenanceFeePayoutBtcAddress;

        return entity;
    }

}
