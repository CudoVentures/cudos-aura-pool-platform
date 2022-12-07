import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';

export enum MiningFarmStatus {
    APPROVED = 'approved',
    QUEUED = 'queued',
    DELETED = 'deleted',
    ANY = 'any',
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
            'id': parseInt(entity.id),
            'creator_id': parseInt(entity.accountId),
            'name': entity.name,
            'sub_account_name': entity.legalName,
            'primary_account_owner_name': entity.primaryAccountOwnerName,
            'primary_account_owner_email': entity.primaryAccountOwnerEmail,
            'description': entity.description,
            'manufacturers': entity.manufacturerIds,
            'miner_types': entity.minerIds,
            'energy_source': entity.energySourceIds,
            'total_farm_hashrate': entity.hashPowerInTh,
            'location': entity.machinesLocation,
            'profile_img': entity.profileImgUrl,
            'cover_img': entity.coverImgUrl,
            'images': entity.farmPhotoUrls,
            'status': entity.status,
            'maintenance_fee_in_btc': entity.maintenanceFeeInBtc.toString(),
            'cudos_mint_nft_royalties_percent': entity.cudosMintNftRoyaltiesPercent,
            'cudos_resale_nft_royalties_percent': entity.cudosResaleNftRoyaltiesPercent,
            'resale_farm_royalties_cudos_address': entity.resaleFarmRoyaltiesCudosAddress,
            'address_for_receiving_rewards_from_pool': entity.rewardsFromPoolBtcAddress,
            'leftover_reward_payout_address': entity.leftoverRewardsBtcAddress,
            'maintenance_fee_payout_address': entity.maintenanceFeePayoutBtcAddress,
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
        model.manufacturerIds = json.manufacturers ?? model.manufacturerIds;
        model.minerIds = json.miner_types ?? model.minerIds;
        model.energySourceIds = json.energy_source ?? model.energySourceIds;
        model.hashPowerInTh = Number(json.total_farm_hashrate ?? model.hashPowerInTh);
        model.machinesLocation = json.location ?? model.machinesLocation;
        model.profileImgUrl = json.profile_img ?? model.profileImgUrl;
        model.coverImgUrl = json.cover_img ?? model.coverImgUrl;
        model.farmPhotoUrls = json.images ?? model.farmPhotoUrls;
        model.status = json.status ?? model.status;
        model.maintenanceFeeInBtc = new BigNumber(json.maintenance_fee_in_btc ?? model.maintenanceFeeInBtc);
        model.cudosMintNftRoyaltiesPercent = Number(json.cudos_mint_nft_royalties_percent ?? model.cudosMintNftRoyaltiesPercent);
        model.cudosResaleNftRoyaltiesPercent = Number(json.cudos_resale_nft_royalties_percent ?? model.cudosResaleNftRoyaltiesPercent);
        model.resaleFarmRoyaltiesCudosAddress = json.resale_farm_royalties_cudos_address ?? model.resaleFarmRoyaltiesCudosAddress;
        model.rewardsFromPoolBtcAddress = json.address_for_receiving_rewards_from_pool ?? model.rewardsFromPoolBtcAddress;
        model.leftoverRewardsBtcAddress = json.leftover_reward_payout_address ?? model.leftoverRewardsBtcAddress;
        model.maintenanceFeePayoutBtcAddress = json.maintenance_fee_payout_address ?? model.maintenanceFeePayoutBtcAddress;

        return model;
    }

}
