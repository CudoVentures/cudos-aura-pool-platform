import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../../common/utils';
import { FarmStatus, MiningFarmJsonValidator } from '../farm.types';
import { MiningFarmRepo } from '../repos/mining-farm.repo';
import AccountEntity from '../../account/entities/account.entity';

export default class MiningFarmEntity {

    id: number;
    accountId: number;
    name: string;
    legalName: string;
    subAccountName: string;
    rewardsFromPoolBtcWalletName: string;
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
    status: FarmStatus;
    maintenanceFeeInBtc: BigNumber;
    farmStartTime: number;

    // royalties paid to cudos percents
    cudosMintNftRoyaltiesPercent: number;
    cudosResaleNftRoyaltiesPercent: number;

    // ADRESSES
    resaleFarmRoyaltiesCudosAddress: string;
    rewardsFromPoolBtcAddress: string;
    leftoverRewardsBtcAddress: string;
    maintenanceFeePayoutBtcAddress: string;

    constructor() {
        this.id = NOT_EXISTS_INT;
        this.accountId = NOT_EXISTS_INT;
        this.name = '';
        this.legalName = '';
        this.subAccountName = '';
        this.rewardsFromPoolBtcWalletName = '';
        this.primaryAccountOwnerName = '';
        this.primaryAccountOwnerEmail = '';
        this.description = '';
        this.manufacturerIds = [];
        this.minerIds = [];
        this.energySourceIds = [];
        this.hashPowerInTh = NOT_EXISTS_INT;
        this.machinesLocation = '';
        this.profileImgUrl = '/assets/profile/profile.png';
        this.coverImgUrl = '/assets/profile/cover.png';
        this.farmPhotoUrls = [];
        this.status = FarmStatus.QUEUED;
        this.maintenanceFeeInBtc = null;
        this.cudosMintNftRoyaltiesPercent = NOT_EXISTS_INT;
        this.cudosResaleNftRoyaltiesPercent = NOT_EXISTS_INT;
        this.resaleFarmRoyaltiesCudosAddress = '';
        this.rewardsFromPoolBtcAddress = '';
        this.leftoverRewardsBtcAddress = '';
        this.maintenanceFeePayoutBtcAddress = '';
        this.farmStartTime = NOT_EXISTS_INT;
    }

    isNew(): boolean {
        return this.id === NOT_EXISTS_INT;
    }

    isApproved(): boolean {
        return this.status === FarmStatus.APPROVED;
    }

    areBtcPayoutAddressesUnique(): boolean {
        return this.rewardsFromPoolBtcAddress !== this.leftoverRewardsBtcAddress && this.rewardsFromPoolBtcAddress !== this.maintenanceFeePayoutBtcAddress && this.leftoverRewardsBtcAddress !== this.maintenanceFeePayoutBtcAddress;
    }

    static toRepo(entity: MiningFarmEntity): MiningFarmRepo {
        if (entity === null) {
            return null;
        }

        const repoJson = new MiningFarmRepo();

        if (entity.isNew() === false) {
            repoJson.id = entity.id;
        }

        repoJson.name = entity.name;
        repoJson.description = entity.description;
        repoJson.legalName = entity.legalName;
        repoJson.subAccountName = entity.subAccountName;
        repoJson.rewardsFromPoolBtcWalletName = entity.rewardsFromPoolBtcWalletName;
        repoJson.location = entity.machinesLocation;
        repoJson.primaryAccountOwnerName = entity.primaryAccountOwnerName;
        repoJson.primaryAccountOwnerEmail = entity.primaryAccountOwnerEmail;
        repoJson.cudosMintNftRoyaltiesPercent = entity.cudosMintNftRoyaltiesPercent.toString();
        repoJson.cudosResaleNftRoyaltiesPercent = entity.cudosResaleNftRoyaltiesPercent.toString();
        repoJson.resaleFarmRoyaltiesCudosAddress = entity.resaleFarmRoyaltiesCudosAddress;
        repoJson.addressForReceivingRewardsFromPool = entity.rewardsFromPoolBtcAddress;
        repoJson.leftoverRewardPayoutAddress = entity.leftoverRewardsBtcAddress;
        repoJson.maintenanceFeePayoutAddress = entity.maintenanceFeePayoutBtcAddress;
        repoJson.maintenanceFeeInBtc = entity.maintenanceFeeInBtc?.toString(10) ?? '';
        repoJson.totalFarmHashrate = entity.hashPowerInTh.toString();
        repoJson.manufacturers = entity.manufacturerIds;
        repoJson.minerTypes = entity.minerIds;
        repoJson.energySource = entity.energySourceIds;
        repoJson.images = entity.farmPhotoUrls;
        repoJson.coverImg = entity.coverImgUrl;
        repoJson.profileImg = entity.profileImgUrl;
        repoJson.status = entity.status;
        repoJson.creatorId = entity.accountId;
        repoJson.farmStartTime = entity.farmStartTime !== NOT_EXISTS_INT ? new Date(entity.farmStartTime) : null;

        return repoJson;
    }

    static fromRepo(repoJson: MiningFarmRepo): MiningFarmEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new MiningFarmEntity();

        entity.id = repoJson.id ?? entity.id;
        entity.description = repoJson.description ?? entity.description;
        entity.legalName = repoJson.legalName ?? entity.legalName;
        entity.subAccountName = repoJson.subAccountName ?? entity.subAccountName;
        entity.rewardsFromPoolBtcWalletName = repoJson.rewardsFromPoolBtcWalletName ?? entity.rewardsFromPoolBtcWalletName;
        entity.machinesLocation = repoJson.location ?? entity.machinesLocation;
        entity.name = repoJson.name ?? entity.name;
        entity.primaryAccountOwnerName = repoJson.primaryAccountOwnerName ?? entity.primaryAccountOwnerName;
        entity.primaryAccountOwnerEmail = repoJson.primaryAccountOwnerEmail ?? entity.primaryAccountOwnerEmail;
        entity.cudosMintNftRoyaltiesPercent = Number(repoJson.cudosMintNftRoyaltiesPercent) ?? entity.cudosMintNftRoyaltiesPercent;
        entity.cudosResaleNftRoyaltiesPercent = Number(repoJson.cudosResaleNftRoyaltiesPercent) ?? entity.cudosResaleNftRoyaltiesPercent;
        entity.resaleFarmRoyaltiesCudosAddress = repoJson.resaleFarmRoyaltiesCudosAddress ?? entity.resaleFarmRoyaltiesCudosAddress;
        entity.rewardsFromPoolBtcAddress = repoJson.addressForReceivingRewardsFromPool ?? entity.rewardsFromPoolBtcAddress;
        entity.leftoverRewardsBtcAddress = repoJson.leftoverRewardPayoutAddress ?? entity.leftoverRewardsBtcAddress;
        entity.maintenanceFeePayoutBtcAddress = repoJson.maintenanceFeePayoutAddress ?? entity.maintenanceFeePayoutBtcAddress;
        entity.maintenanceFeeInBtc = repoJson.maintenanceFeeInBtc === '' ? null : new BigNumber(repoJson.maintenanceFeeInBtc);
        entity.hashPowerInTh = Number(repoJson.totalFarmHashrate) ?? entity.hashPowerInTh;
        entity.manufacturerIds = repoJson.manufacturers ?? entity.manufacturerIds;
        entity.minerIds = repoJson.minerTypes ?? entity.minerIds;
        entity.energySourceIds = repoJson.energySource ?? entity.energySourceIds;
        entity.farmPhotoUrls = repoJson.images ?? entity.farmPhotoUrls;
        entity.coverImgUrl = repoJson.coverImg ?? entity.coverImgUrl;
        entity.profileImgUrl = repoJson.profileImg ?? entity.profileImgUrl;
        entity.status = repoJson.status ?? entity.status;
        entity.accountId = repoJson.creatorId ?? entity.accountId;
        entity.farmStartTime = repoJson.farmStartTime?.getTime() ?? entity.farmStartTime;

        return entity;
    }

    static toJson(entity: MiningFarmEntity, currentUser: AccountEntity): MiningFarmJsonValidator {
        if (entity === null) {
            return null;
        }

        let hideData;
        if (currentUser?.isSuperAdmin() === true) {
            hideData = false;
        } else if (currentUser?.isAdmin() === true) {
            hideData = entity.accountId !== currentUser.accountId;
        } else {
            hideData = true;
        }

        return {
            'id': entity.id.toString(),
            'accountId': entity.accountId.toString(),
            'name': entity.name,
            'legalName': entity.legalName,
            'subAccountName': entity.subAccountName,
            'rewardsFromPoolBtcWalletName': entity.rewardsFromPoolBtcWalletName,
            'primaryAccountOwnerName': hideData === false ? entity.primaryAccountOwnerName : '',
            'primaryAccountOwnerEmail': hideData === false ? entity.primaryAccountOwnerEmail : '',
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
            'farmStartTime': entity.farmStartTime,
        }
    }

    static fromJson(json: MiningFarmJsonValidator): MiningFarmEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmEntity();

        entity.id = parseInt(json.id ?? entity.id.toString());
        entity.accountId = parseInt(json.accountId ?? entity.accountId.toString());
        entity.name = json.name ?? entity.name;
        entity.legalName = json.legalName ?? entity.legalName;
        entity.subAccountName = json.subAccountName ?? entity.subAccountName;
        entity.rewardsFromPoolBtcWalletName = json.rewardsFromPoolBtcWalletName ?? entity.rewardsFromPoolBtcWalletName;
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
        entity.status = (json.status ?? entity.status);
        entity.maintenanceFeeInBtc = json.maintenanceFeeInBtc === null ? null : new BigNumber(json.maintenanceFeeInBtc);
        entity.cudosMintNftRoyaltiesPercent = Number(json.cudosMintNftRoyaltiesPercent ?? entity.cudosMintNftRoyaltiesPercent);
        entity.cudosResaleNftRoyaltiesPercent = Number(json.cudosResaleNftRoyaltiesPercent ?? entity.cudosResaleNftRoyaltiesPercent);
        entity.resaleFarmRoyaltiesCudosAddress = json.resaleFarmRoyaltiesCudosAddress ?? entity.resaleFarmRoyaltiesCudosAddress;
        entity.rewardsFromPoolBtcAddress = json.rewardsFromPoolBtcAddress ?? entity.rewardsFromPoolBtcAddress;
        entity.leftoverRewardsBtcAddress = json.leftoverRewardsBtcAddress ?? entity.leftoverRewardsBtcAddress;
        entity.maintenanceFeePayoutBtcAddress = json.maintenanceFeePayoutBtcAddress ?? entity.maintenanceFeePayoutBtcAddress;
        entity.farmStartTime = json.farmStartTime ?? entity.farmStartTime;

        return entity;
    }

}
