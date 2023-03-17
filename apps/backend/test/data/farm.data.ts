import EnergySourceEntity from '../../src/farm/entities/energy-source.entity';
import ManufacturerEntity from '../../src/farm/entities/manufacturer.entity';
import MinerEntity from '../../src/farm/entities/miner.entity';
import MiningFarmEntity from '../../src/farm/entities/mining-farm.entity';
import { FarmStatus } from '../../src/farm/farm.types';

// accountId (user) 1 - farms 1-4. accountId 2 - farm 5
// farms 1 - 5 - have the same manufacturers, miners, energysources. Might need changing later, if filtering for them is added.
// APPROVED - farms 1, 2, 5, QUEUED - farm 3, REJECTED - farm 4
// hash power for all farms - 10
// btc maintenance fee for all farms - 0.001
// cudosMintNftRoyaltiesPercen for all farms - 10
// cudosResaleNftRoyaltiesPercent for all farms - 2.5

export const miningFarmEntities = [
    MiningFarmEntity.fromJson({
        id: '1',
        accountId: '1',
        name: 'string', // So far changing them won't affect anything
        legalName: 'string', // So far changing them won't affect anything
        rewardsFromPoolBtcWalletName: 'string', // So far changing them won't affect anything
        primaryAccountOwnerName: 'string', // So far changing them won't affect anything
        primaryAccountOwnerEmail: 'string', // So far changing them won't affect anything
        description: 'string', // So far changing them won't affect anything
        manufacturerIds: ['1'], // So far changing them won't affect anything
        minerIds: ['1'], // So far changing them won't affect anything
        energySourceIds: ['1'], // So far changing them won't affect anything
        hashPowerInTh: 10,
        machinesLocation: 'string', // So far changing them won't affect anything
        profileImgUrl: 'string', // So far changing them won't affect anything
        coverImgUrl: 'string', // So far changing them won't affect anything
        farmPhotoUrls: ['url'], // So far changing them won't affect anything
        status: FarmStatus.APPROVED,
        maintenanceFeeInBtc: '0.0001',
        cudosMintNftRoyaltiesPercent: 10,
        cudosResaleNftRoyaltiesPercent: 2.5,
        resaleFarmRoyaltiesCudosAddress: 'string', // So far changing them won't affect anything
        rewardsFromPoolBtcAddress: 'string', // So far changing them won't affect anything
        leftoverRewardsBtcAddress: 'string', // So far changing them won't affect anything
        maintenanceFeePayoutBtcAddress: 'string', // So far changing them won't affect anything
    }), MiningFarmEntity.fromJson({
        id: '2',
        accountId: '1',
        name: 'string', // So far changing them won't affect anything
        legalName: 'string', // So far changing them won't affect anything
        rewardsFromPoolBtcWalletName: 'string', // So far changing them won't affect anything
        primaryAccountOwnerName: 'string', // So far changing them won't affect anything
        primaryAccountOwnerEmail: 'string', // So far changing them won't affect anything
        description: 'string', // So far changing them won't affect anything
        manufacturerIds: ['1'], // So far changing them won't affect anything
        minerIds: ['1'], // So far changing them won't affect anything
        energySourceIds: ['1'], // So far changing them won't affect anything
        hashPowerInTh: 10,
        machinesLocation: 'string', // So far changing them won't affect anything
        profileImgUrl: 'string', // So far changing them won't affect anything
        coverImgUrl: 'string', // So far changing them won't affect anything
        farmPhotoUrls: ['url'], // So far changing them won't affect anything
        status: FarmStatus.APPROVED,
        maintenanceFeeInBtc: '0.0001',
        cudosMintNftRoyaltiesPercent: 10,
        cudosResaleNftRoyaltiesPercent: 2.5,
        resaleFarmRoyaltiesCudosAddress: 'string', // So far changing them won't affect anything
        rewardsFromPoolBtcAddress: 'string', // So far changing them won't affect anything
        leftoverRewardsBtcAddress: 'string', // So far changing them won't affect anything
        maintenanceFeePayoutBtcAddress: 'string', // So far changing them won't affect anything
    }), MiningFarmEntity.fromJson({
        id: '3',
        accountId: '1',
        name: 'string', // So far changing them won't affect anything
        legalName: 'string', // So far changing them won't affect anything
        rewardsFromPoolBtcWalletName: 'string', // So far changing them won't affect anything
        primaryAccountOwnerName: 'string', // So far changing them won't affect anything
        primaryAccountOwnerEmail: 'string', // So far changing them won't affect anything
        description: 'string', // So far changing them won't affect anything
        manufacturerIds: ['1'], // So far changing them won't affect anything
        minerIds: ['1'], // So far changing them won't affect anything
        energySourceIds: ['1'], // So far changing them won't affect anything
        hashPowerInTh: 10,
        machinesLocation: 'string', // So far changing them won't affect anything
        profileImgUrl: 'string', // So far changing them won't affect anything
        coverImgUrl: 'string', // So far changing them won't affect anything
        farmPhotoUrls: ['url'], // So far changing them won't affect anything
        status: FarmStatus.QUEUED,
        maintenanceFeeInBtc: '0.0001',
        cudosMintNftRoyaltiesPercent: 10,
        cudosResaleNftRoyaltiesPercent: 2.5,
        resaleFarmRoyaltiesCudosAddress: 'string', // So far changing them won't affect anything
        rewardsFromPoolBtcAddress: 'string', // So far changing them won't affect anything
        leftoverRewardsBtcAddress: 'string', // So far changing them won't affect anything
        maintenanceFeePayoutBtcAddress: 'string', // So far changing them won't affect anything
    }), MiningFarmEntity.fromJson({
        id: '4',
        accountId: '1',
        name: 'string', // So far changing them won't affect anything
        legalName: 'string', // So far changing them won't affect anything
        rewardsFromPoolBtcWalletName: 'string', // So far changing them won't affect anything
        primaryAccountOwnerName: 'string', // So far changing them won't affect anything
        primaryAccountOwnerEmail: 'string', // So far changing them won't affect anything
        description: 'string', // So far changing them won't affect anything
        manufacturerIds: ['1'], // So far changing them won't affect anything
        minerIds: ['1'], // So far changing them won't affect anything
        energySourceIds: ['1'], // So far changing them won't affect anything
        hashPowerInTh: 10,
        machinesLocation: 'string', // So far changing them won't affect anything
        profileImgUrl: 'string', // So far changing them won't affect anything
        coverImgUrl: 'string', // So far changing them won't affect anything
        farmPhotoUrls: ['url'], // So far changing them won't affect anything
        status: FarmStatus.REJECTED,
        maintenanceFeeInBtc: '0.0001',
        cudosMintNftRoyaltiesPercent: 10,
        cudosResaleNftRoyaltiesPercent: 2.5,
        resaleFarmRoyaltiesCudosAddress: 'string', // So far changing them won't affect anything
        rewardsFromPoolBtcAddress: 'string', // So far changing them won't affect anything
        leftoverRewardsBtcAddress: 'string', // So far changing them won't affect anything
        maintenanceFeePayoutBtcAddress: 'string', // So far changing them won't affect anything
    }), MiningFarmEntity.fromJson({
        id: '5',
        accountId: '2',
        name: 'string', // So far changing them won't affect anything
        legalName: 'string', // So far changing them won't affect anything
        rewardsFromPoolBtcWalletName: 'string', // So far changing them won't affect anything
        primaryAccountOwnerName: 'string', // So far changing them won't affect anything
        primaryAccountOwnerEmail: 'string', // So far changing them won't affect anything
        description: 'string', // So far changing them won't affect anything
        manufacturerIds: ['1'], // So far changing them won't affect anything
        minerIds: ['1'], // So far changing them won't affect anything
        energySourceIds: ['1'], // So far changing them won't affect anything
        hashPowerInTh: 10,
        machinesLocation: 'string', // So far changing them won't affect anything
        profileImgUrl: 'string', // So far changing them won't affect anything
        coverImgUrl: 'string', // So far changing them won't affect anything
        farmPhotoUrls: ['url'], // So far changing them won't affect anything
        status: FarmStatus.APPROVED,
        maintenanceFeeInBtc: '0.0001',
        cudosMintNftRoyaltiesPercent: 10,
        cudosResaleNftRoyaltiesPercent: 2.5,
        resaleFarmRoyaltiesCudosAddress: 'string', // So far changing them won't affect anything
        rewardsFromPoolBtcAddress: 'string', // So far changing them won't affect anything
        leftoverRewardsBtcAddress: 'string', // So far changing them won't affect anything
        maintenanceFeePayoutBtcAddress: 'string', // So far changing them won't affect anything
    }),
]

export const energySourceEntities = [
    EnergySourceEntity.fromJson({ energySourceId: '1', name: 'energysourcename' }),
]

export const minerEntities = [
    MinerEntity.fromJson({ minerId: '1', name: 'minername' }),
]

export const manufacturerEntities = [
    ManufacturerEntity.fromJson({ manufacturerId: '1', name: 'manufacturername' }),
]
