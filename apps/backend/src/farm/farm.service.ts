import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpService } from '@nestjs/axios';
import MiningFarmFilterModel from './dto/farm-filter.model';
import sequelize, { LOCK, Op, Transaction } from 'sequelize';
import { VisitorService } from '../visitor/visitor.service';
import AccountEntity from '../account/entities/account.entity';
import MiningFarmEntity from './entities/mining-farm.entity';
import { MiningFarmRepo, MiningFarmRepoColumn } from './repos/mining-farm.repo';
import AppRepo from '../common/repo/app.repo';
import DataService from '../data/data.service';
import { DataServiceError, ERROR_TYPES, FarmCreationError, NotFoundException } from '../common/errors/errors';
import EnergySourceEntity from './entities/energy-source.entity';
import { EnergySourceRepo } from './repos/energy-source.repo';
import { MinerRepo } from './repos/miner.repo';
import { ManufacturerRepo } from './repos/manufacturer.repo';
import MinerEntity from './entities/miner.entity';
import ManufacturerEntity from './entities/manufacturer.entity';
import { CollectionService } from '../collection/collection.service';
import { NFTService } from '../nft/nft.service';
import MiningFarmDetailsEntity from './entities/mining-farm-details.entity';
import NftEventFilterEntity from '../statistics/entities/nft-event-filter.entity';
import { StatisticsService } from '../statistics/statistics.service';
import { NftTransferHistoryEventType } from '../statistics/entities/nft-event.entity';
import MiningFarmPerformanceEntity from './entities/mining-farm-performance.entity';
import { BIG_NUMBER_0, NOT_EXISTS_INT } from '../common/utils';
import CryptoCompareService from '../crypto-compare/crypto-compare.service';

@Injectable()
export class FarmService {
    constructor(
        @InjectModel(MiningFarmRepo)
        private miningFarmRepo: typeof MiningFarmRepo,
        @InjectModel(EnergySourceRepo)
        private energySourceRepo: typeof EnergySourceRepo,
        @InjectModel(MinerRepo)
        private minerRepo: typeof MinerRepo,
        @InjectModel(ManufacturerRepo)
        private manufacturerRepo: typeof ManufacturerRepo,

        @Inject(forwardRef(() => NFTService))
        private nftService: NFTService,
        @Inject(forwardRef(() => CollectionService))
        private collectionService: CollectionService,
        private httpService: HttpService,
        private visitorService: VisitorService,
        private dataService: DataService,
        @Inject(forwardRef(() => StatisticsService))
        private statisticsService: StatisticsService,
        private cryptoCompareService: CryptoCompareService,
    ) {}

    async findByFilter(accountEntity: AccountEntity, miningFarmFilterModel: MiningFarmFilterModel, dbTx: Transaction, dbLock: LOCK = undefined): Promise < { miningFarmEntities: MiningFarmEntity[], total: number } > {
        let whereClause: any = {};

        if (miningFarmFilterModel.hasMiningFarmIds() === true) {
            whereClause[MiningFarmRepoColumn.ID] = miningFarmFilterModel.miningFarmIds;
        }

        if (miningFarmFilterModel.hasMiningFarmStatus() === true) {
            whereClause[MiningFarmRepoColumn.STATUS] = {
                [Op.in]: miningFarmFilterModel.getMiningFarmStatuses(),
            }
        }

        if (miningFarmFilterModel.inOnlyForSessionAccount() === true) {
            whereClause[MiningFarmRepoColumn.CREATOR_ID] = accountEntity.accountId;
        }

        if (miningFarmFilterModel.hasSearchString() === true) {
            whereClause = [
                whereClause,
                sequelize.where(sequelize.fn('LOWER', sequelize.col(MiningFarmRepoColumn.NAME)), { [Op.like]: `%${miningFarmFilterModel.searchString.toLowerCase()}%` }),
            ]
        }

        const miningFarmRepos = await this.miningFarmRepo.findAll({
            where: whereClause,
            transaction: dbTx,
            lock: dbLock,
        });
        let miningFarmEntities = miningFarmRepos.map((miningFarmRepo) => {
            return MiningFarmEntity.fromRepo(miningFarmRepo);
        });

        if (miningFarmFilterModel.isSortByPopular() === true) {
            const miningFarmIds = miningFarmEntities.map((miningFarmEntity) => {
                return miningFarmEntity.id;
            });
            const sortDirection = Math.floor(Math.abs(miningFarmFilterModel.orderBy) / miningFarmFilterModel.orderBy);
            const visitorMap = await this.visitorService.fetchMiningFarmVisitsCount(miningFarmIds, dbTx, dbLock);
            miningFarmEntities.sort((a: MiningFarmEntity, b: MiningFarmEntity) => {
                const visitsA = visitorMap.get(a.id) ?? 0;
                const visitsB = visitorMap.get(b.id) ?? 0;
                return sortDirection * (visitsA - visitsB);
            });
        }

        const total = miningFarmEntities.length;
        const countPerPage = miningFarmFilterModel.count;
        let from = miningFarmFilterModel.from;
        if (from >= total) {
            from = Math.max(0, countPerPage * Math.floor((total - 1) / countPerPage));
        }

        miningFarmEntities = miningFarmEntities.slice(from, from + miningFarmFilterModel.count);
        return {
            miningFarmEntities,
            total,
        };
    }

    async findBestPerformingMiningFarms(timestampFrom: number, timestampTo: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < { miningFarmEntities: MiningFarmEntity[], miningFarmPerformanceEntities: MiningFarmPerformanceEntity[] } > {
        const nftToMiningFarmIdsMap = new Map < string, number >();
        const collectionToMiningFarmIdsMap = new Map < number, number >();
        const miningFarmIdToVolumeInUsdMap = new Map < number, number >();

        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.timestampFrom = timestampFrom;
        nftEventFilterEntity.timestampTo = timestampTo;
        nftEventFilterEntity.eventTypes = [NftTransferHistoryEventType.MINT, NftTransferHistoryEventType.SALE];

        const { nftEventEntities, nftEntities } = await this.statisticsService.fetchNftEventsByFilter(null, nftEventFilterEntity, dbTx, dbLock);
        const collectionIds = nftEntities.map((nftEntity) => nftEntity.collectionId);
        const collectionEntities = await this.collectionService.findByCollectionIds(collectionIds, dbTx, dbLock);
        let miningFarmIds = collectionEntities.map((collectionEntity) => collectionEntity.farmId);
        let miningFarmEntities = await this.findMiningFarmByIds(miningFarmIds, dbTx, dbLock);

        collectionEntities.forEach((collectionEntity) => {
            collectionToMiningFarmIdsMap.set(collectionEntity.id, collectionEntity.farmId);
        });
        nftEntities.forEach((nftEntity) => {
            const miningFarmId = collectionToMiningFarmIdsMap.get(nftEntity.collectionId);
            nftToMiningFarmIdsMap.set(nftEntity.id, miningFarmId);
        });
        nftEventEntities.forEach((nftEventEntity) => {
            const miningFarmId = nftToMiningFarmIdsMap.get(nftEventEntity.nftId);
            const volumeInUsd = miningFarmIdToVolumeInUsdMap.get(miningFarmId) ?? 0;
            miningFarmIdToVolumeInUsdMap.set(miningFarmId, volumeInUsd + nftEventEntity.transferPriceInUsd);
        });

        miningFarmEntities.sort((a: MiningFarmEntity, b: MiningFarmEntity) => {
            const volumeInUsdA = miningFarmIdToVolumeInUsdMap.get(a.id) ?? 0;
            const volumeInUsdB = miningFarmIdToVolumeInUsdMap.get(b.id) ?? 0;
            return volumeInUsdB - volumeInUsdA;
        });

        // miningFarmEntities = await this.findMiningFarmByIds([1]); // debug
        miningFarmEntities = miningFarmEntities.slice(0, 5);
        miningFarmIds = miningFarmEntities.map((miningFarmEntity) => miningFarmEntity.id);

        const miningFarmPerformanceEntities = await this.findMiningFarmPerformanceByIds(miningFarmIds, dbTx, dbLock);

        return { miningFarmEntities, miningFarmPerformanceEntities };
    }

    async findMiningFarmPerformanceByIds(miningFarmIds: number[], dbTx: Transaction, dbLock: LOCK = undefined): Promise < MiningFarmPerformanceEntity[] > {
        const selectedMiningFarmIds = new Set(miningFarmIds);
        const miningFarmIdToPerformanceEntitiesMap = new Map < number, MiningFarmPerformanceEntity >();
        const nftToMiningFarmIdsMap = new Map < string, number >();
        const collectionToMiningFarmIdsMap = new Map < number, number >();

        const date = new Date();
        date.setDate(date.getDate() - 1);
        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.timestampFrom = date.getTime();
        nftEventFilterEntity.timestampTo = Date.now();
        nftEventFilterEntity.eventTypes = [NftTransferHistoryEventType.MINT, NftTransferHistoryEventType.SALE];
        const { nftEventEntities } = await this.statisticsService.fetchNftEventsByFilter(null, nftEventFilterEntity, dbTx, dbLock);

        const collectionEntities = await this.collectionService.findByMiningFarmIds(miningFarmIds, dbTx, dbLock);
        const collectionIds = collectionEntities.map((collectionEntity) => collectionEntity.id);
        const nftEntities = await this.nftService.findByCollectionIds(collectionIds, dbTx, dbLock);
        collectionEntities.forEach((collectionEntity) => {
            collectionToMiningFarmIdsMap.set(collectionEntity.id, collectionEntity.farmId);
        });
        miningFarmIds.forEach((miningFarmId) => {
            miningFarmIdToPerformanceEntitiesMap.set(miningFarmId, MiningFarmPerformanceEntity.newInstanceForMiningFarm(miningFarmId));
        });
        for (let i = nftEntities.length; i-- > 0;) {
            const nftEntity = nftEntities[i];
            const miningFarmId = collectionToMiningFarmIdsMap.get(nftEntity.collectionId);
            nftToMiningFarmIdsMap.set(nftEntity.id, miningFarmId);

            const priceInAcudos = await this.cryptoCompareService.getNftPriceInAcudos(nftEntity);
            if (priceInAcudos.gt(BIG_NUMBER_0) === true) {
                const miningFarmPerformanceEntity = miningFarmIdToPerformanceEntitiesMap.get(miningFarmId);
                if (miningFarmPerformanceEntity.isFloorPriceSet() === false || miningFarmPerformanceEntity.floorPriceInAcudos.gt(priceInAcudos) === true) {
                    miningFarmPerformanceEntity.floorPriceInAcudos = priceInAcudos;
                }
            }
        }

        nftEventEntities.forEach((nftEventEntity) => {
            const miningFarmId = nftToMiningFarmIdsMap.get(nftEventEntity.nftId) ?? NOT_EXISTS_INT;

            if (selectedMiningFarmIds.has(miningFarmId) === false) {
                return;
            }

            let miningFarmPerformanceEntity = miningFarmIdToPerformanceEntitiesMap.get(miningFarmId);
            if (miningFarmPerformanceEntity === undefined) {
                miningFarmPerformanceEntity = MiningFarmPerformanceEntity.newInstanceForMiningFarm(miningFarmId);
                miningFarmIdToPerformanceEntitiesMap.set(miningFarmId, miningFarmPerformanceEntity);
            }

            miningFarmPerformanceEntity.volumePer24HoursInAcudos = miningFarmPerformanceEntity.volumePer24HoursInAcudos.plus(nftEventEntity.transferPriceInAcudos);
            miningFarmPerformanceEntity.volumePer24HoursInUsd += nftEventEntity.transferPriceInUsd;
        });

        const miningFarmPerformanceEntities = [];
        miningFarmIdToPerformanceEntitiesMap.forEach((miningFarmPerformanceEntity) => {
            miningFarmPerformanceEntities.push(miningFarmPerformanceEntity);
        });

        return miningFarmPerformanceEntities;
    }

    async findMiningFarmById(id: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < MiningFarmEntity > {
        const miningFarmRepo = await this.miningFarmRepo.findByPk(id, {
            transaction: dbTx,
            lock: dbLock,
        });
        return MiningFarmEntity.fromRepo(miningFarmRepo);
    }

    async findMiningFarmByIds(miningFarmIds: number[], dbTx: Transaction, dbLock: LOCK = undefined): Promise < MiningFarmEntity[] > {
        const miningFarmRepos = await this.miningFarmRepo.findAll({
            where: {
                [MiningFarmRepoColumn.ID]: miningFarmIds,
            },
            transaction: dbTx,
            lock: dbLock,
        });
        return miningFarmRepos.map((miningFarmRepo) => {
            return MiningFarmEntity.fromRepo(miningFarmRepo);
        });
    }

    async creditMiningFarm(miningFarmEntity: MiningFarmEntity, creditImages: boolean, dbTx: Transaction): Promise < MiningFarmEntity > {
        let newUris = [], oldUris = [];

        if (creditImages === true) {
            try {
                miningFarmEntity.coverImgUrl = await this.dataService.trySaveUri(miningFarmEntity.accountId, miningFarmEntity.coverImgUrl);
                miningFarmEntity.profileImgUrl = await this.dataService.trySaveUri(miningFarmEntity.accountId, miningFarmEntity.profileImgUrl);
                for (let i = miningFarmEntity.farmPhotoUrls.length; i-- > 0;) {
                    miningFarmEntity.farmPhotoUrls[i] = await this.dataService.trySaveUri(miningFarmEntity.accountId, miningFarmEntity.farmPhotoUrls[i]);
                }
            } catch (e) {
                console.log(e)
                throw new DataServiceError();
            }
            newUris = [miningFarmEntity.coverImgUrl, miningFarmEntity.profileImgUrl].concat(miningFarmEntity.farmPhotoUrls);
        }

        let miningFarmRepo = MiningFarmEntity.toRepo(miningFarmEntity);
        try {
            if (miningFarmEntity.isNew() === true) {
                miningFarmRepo = await this.miningFarmRepo.create(miningFarmRepo.toJSON(), {
                    returning: true,
                    transaction: dbTx,
                })
            } else {
                if (creditImages === true) {
                    const miningFarmRepoDb = await this.findMiningFarmById(miningFarmRepo.id, dbTx, dbTx.LOCK.UPDATE);
                    if (!miningFarmRepoDb) {
                        throw new NotFoundException();
                    }
                    oldUris = [miningFarmRepoDb.coverImgUrl, miningFarmRepoDb.profileImgUrl].concat(miningFarmRepoDb.farmPhotoUrls);
                }

                const whereClause = new MiningFarmRepo();
                whereClause.id = miningFarmRepo.id;
                const sqlResult = await this.miningFarmRepo.update(miningFarmRepo.toJSON(), {
                    where: AppRepo.toJsonWhere(whereClause),
                    returning: true,
                    transaction: dbTx,
                })
                miningFarmRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
            }
            this.dataService.cleanUpOldUris(oldUris, newUris);
        } catch (ex) {
            this.dataService.cleanUpNewUris(oldUris, newUris);
            const errMessage = ex.response?.message;
            console.log(ex)
            switch (errMessage) {
                case ERROR_TYPES.NOT_FOUND:
                    throw ex;
                default:
                    throw new FarmCreationError();
            }
        }

        return MiningFarmEntity.fromRepo(miningFarmRepo);
    }

    async findMiners(dbTx: Transaction, dbLock: LOCK = undefined): Promise < MinerEntity[] > {
        const minerRepos = await this.minerRepo.findAll({
            transaction: dbTx,
            lock: dbLock,
        });
        return minerRepos.map((minerEntity) => {
            return MinerEntity.fromRepo(minerEntity);
        });
    }

    async findEnergySources(dbTx: Transaction, dbLock: LOCK = undefined): Promise < EnergySourceEntity[] > {
        const energySourceRepos = await this.energySourceRepo.findAll({
            transaction: dbTx,
            lock: dbLock,
        });
        return energySourceRepos.map((energySourceRepo) => {
            return EnergySourceEntity.fromRepo(energySourceRepo);
        });
    }

    async findManufacturers(dbTx: Transaction, dbLock: LOCK = undefined): Promise < ManufacturerEntity[] > {
        const manufacturerRepos = await this.manufacturerRepo.findAll({
            transaction: dbTx,
            lock: dbLock,
        });
        return manufacturerRepos.map((manufacturerRepo) => {
            return ManufacturerEntity.fromRepo(manufacturerRepo);
        })
    }

    async creditEnergySource(energySourceEntity: EnergySourceEntity, dbTx: Transaction): Promise < EnergySourceEntity > {
        let energySourceRepo = EnergySourceEntity.toRepo(energySourceEntity);
        if (energySourceEntity.isNew() === true) {
            energySourceRepo = await this.energySourceRepo.create(energySourceRepo.toJSON(), {
                returning: true,
                transaction: dbTx,
            })
        } else {
            const whereClause = new EnergySourceRepo();
            whereClause.id = energySourceRepo.id;
            const sqlResult = await this.energySourceRepo.update(energySourceRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereClause),
                returning: true,
                transaction: dbTx,
            })
            energySourceRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return EnergySourceEntity.fromRepo(energySourceRepo);
    }

    async creditMiner(minerEntity: MinerEntity, dbTx: Transaction): Promise < MinerEntity > {
        let minerRepo = MinerEntity.toRepo(minerEntity);
        if (minerEntity.isNew() === true) {
            minerRepo = await this.minerRepo.create(minerRepo.toJSON(), {
                returning: true,
                transaction: dbTx,
            })
        } else {
            const whereClause = new MinerRepo();
            whereClause.id = minerRepo.id;
            const sqlResult = await this.minerRepo.update(minerRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereClause),
                returning: true,
                transaction: dbTx,
            })
            minerRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return MinerEntity.fromRepo(minerRepo);
    }

    async creditManufacturer(manufacturerEntity: ManufacturerEntity, dbTx: Transaction): Promise < ManufacturerEntity > {
        let manufacturerRepo = ManufacturerEntity.toRepo(manufacturerEntity);
        if (manufacturerEntity.isNew() === true) {
            manufacturerRepo = await this.manufacturerRepo.create(manufacturerRepo.toJSON(), {
                returning: true,
                transaction: dbTx,
            })
        } else {
            const whereClause = new MinerRepo();
            whereClause.id = manufacturerRepo.id;
            const sqlResult = await this.manufacturerRepo.update(manufacturerRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereClause),
                returning: true,
                transaction: dbTx,
            })
            manufacturerRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return ManufacturerEntity.fromRepo(manufacturerRepo);
    }

    async getMiningFarmDetails(miningFarmIds: number[], includesExternalDetails: boolean, dbTx: Transaction, dbLock: LOCK = undefined): Promise < MiningFarmDetailsEntity[] > {
        const miningFarmEntitiesMap = new Map();
        const collectionEntitiesMap = new Map();
        const miningFarmIdToDetailsMap = new Map();

        const miningFarmEntities = await this.findMiningFarmByIds(miningFarmIds, dbTx, dbLock);
        miningFarmEntities.forEach((miningFarmEntity) => {
            miningFarmEntitiesMap.set(miningFarmEntity.id, miningFarmEntity);
            miningFarmIdToDetailsMap.set(miningFarmEntity.id, MiningFarmDetailsEntity.newInstanceByMiningFarm(miningFarmEntity));
        });

        const collectionEntities = await this.collectionService.findByMiningFarmIds(miningFarmIds, dbTx, dbLock);
        const collectionIds = [];
        collectionEntities.forEach((collectionEntity) => {
            collectionIds.push(collectionEntity.id);
            collectionEntitiesMap.set(collectionEntity.id, collectionEntity);
        });
        const nftEntities = await this.nftService.findByCollectionIds(collectionIds, dbTx, dbLock);
        for (let i = nftEntities.length; i-- > 0;) {
            const nftEntity = nftEntities[i];
            const collectionEntity = collectionEntitiesMap.get(nftEntity.collectionId);
            const miningFarmEntity = miningFarmEntitiesMap.get(collectionEntity.farmId);
            const miningFarmDetailsEntity = miningFarmIdToDetailsMap.get(miningFarmEntity.id);
            miningFarmDetailsEntity.remainingHashPowerInTH -= collectionEntity.hashingPower;
            collectionEntity.hashingPower = 0;

            ++miningFarmDetailsEntity.nftsOwned;
            collectionEntity.hashingPower = 0;
            if (nftEntity.isSold() === true) {
                ++miningFarmDetailsEntity.totalNftsSold;
            }

            const priceInAcudos = await this.cryptoCompareService.getNftPriceInAcudos(nftEntity);
            if (priceInAcudos.gt(BIG_NUMBER_0) === true) {
                if (miningFarmDetailsEntity.floorPriceInAcudos === null) {
                    miningFarmDetailsEntity.floorPriceInAcudos = priceInAcudos;
                } else if (priceInAcudos.lt(miningFarmDetailsEntity.floorPriceInAcudos)) {
                    miningFarmDetailsEntity.floorPriceInAcudos = priceInAcudos;
                }
            }
        }

        const miningFarmDetailsEntities = [];
        miningFarmIdToDetailsMap.forEach((miningFarmDetailsEntity) => {
            miningFarmDetailsEntities.push(miningFarmDetailsEntity);
        });

        if (includesExternalDetails) {
            for (let i = miningFarmDetailsEntities.length; i-- > 0;) {
                const miningFarmDetailsEntity = miningFarmDetailsEntities[i];
                const miningFarmEntity = miningFarmEntitiesMap.get(miningFarmDetailsEntity.miningFarmId);
                const { activeWorkersCount, averageHashRateH1 } = await this.getFoundryFarmWorkersDetails(miningFarmEntity.subAccountName);
                miningFarmDetailsEntity.averageHashPowerInTh = averageHashRateH1;
                miningFarmDetailsEntity.activeWorkers = activeWorkersCount;
            }
        }

        return miningFarmDetailsEntities;
    }

    async getFoundryFarmWorkersDetails(subAccountName: string): Promise < { activeWorkersCount: number, averageHashRateH1: number } > {
        const workersDetails = {
            activeWorkersCount: 0,
            averageHashRateH1: 0,
        }
        try {
            const res = await this.httpService.axiosRef.get(`${process.env.App_Foundry_API}/subaccount_stats/${subAccountName}`, {
                headers: {
                    'x-api-key': process.env.App_Foundry_API_Auth_Token,
                },
            });

            workersDetails.activeWorkersCount = res.data.activeWorkers;
            workersDetails.averageHashRateH1 = res.data.hashrate1hrAvg;
        } catch (err) {
        }

        return workersDetails;
    }

}
