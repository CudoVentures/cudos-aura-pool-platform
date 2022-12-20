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
import CollectionFilterEntity from '../collection/entities/collection-filter.entity';
import NftFilterEntity from '../nft/entities/nft-filter.entity';
import { NFTService } from '../nft/nft.service';
import MiningFarmDetailsEntity from './entities/mining-farm-details.entity';
import NftEventFilterEntity from '../statistics/entities/nft-event-filter.entity';
import { StatisticsService } from '../statistics/statistics.service';
import { NftTransferHistoryEventType } from '../statistics/entities/nft-event.entity';

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
        private nftService: NFTService,
        @Inject(forwardRef(() => CollectionService))
        private collectionService: CollectionService,
        private httpService: HttpService,
        private visitorService: VisitorService,
        private dataService: DataService,
        @Inject(forwardRef(() => StatisticsService))
        private statisticsService: StatisticsService,
    ) {}

    async findByFilter(accountEntity: AccountEntity, miningFarmFilterModel: MiningFarmFilterModel): Promise < { miningFarmEntities: MiningFarmEntity[], total: number } > {
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
        });
        let miningFarmEntities = miningFarmRepos.map((miningFarmRepo) => {
            return MiningFarmEntity.fromRepo(miningFarmRepo);
        });

        if (miningFarmFilterModel.isSortByPopular() === true) {
            const miningFarmIds = miningFarmEntities.map((miningFarmEntity) => {
                return miningFarmEntity.id;
            });
            const sortDirection = Math.floor(Math.abs(miningFarmFilterModel.orderBy) / miningFarmFilterModel.orderBy);
            const visitorMap = await this.visitorService.fetchMiningFarmVisitsCount(miningFarmIds);
            miningFarmEntities.sort((a: MiningFarmEntity, b: MiningFarmEntity) => {
                const visitsA = visitorMap.get(a.id) ?? 0;
                const visitsB = visitorMap.get(b.id) ?? 0;
                return sortDirection * (visitsA - visitsB);
            });
        }

        const total = miningFarmEntities.length;
        miningFarmEntities = miningFarmEntities.slice(miningFarmFilterModel.from, miningFarmFilterModel.from + miningFarmFilterModel.count);

        return {
            miningFarmEntities,
            total,
        };
    }

    async findBestPerformingMiningFarms(timestampFrom: number, timestampTo: number): Promise < MiningFarmEntity[] > {
        const nftToMiningFarmIdsMap = new Map < string, number >();
        const collectionToMiningFarmIdsMap = new Map < number, number >();
        const miningFarmIdToVolumeInUsdMap = new Map < number, number >();

        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.timestampFrom = timestampFrom;
        nftEventFilterEntity.timestampTo = timestampTo;
        nftEventFilterEntity.eventTypes = [NftTransferHistoryEventType.MINT, NftTransferHistoryEventType.SALE];

        const { nftEventEntities, nftEntities } = await this.statisticsService.fetchNftEventsByFilter(null, nftEventFilterEntity);
        const collectionIds = nftEntities.map((nftEntity) => nftEntity.collectionId);
        const collectionEntities = await this.collectionService.findByCollectionIds(collectionIds);
        const miningFarmIds = collectionEntities.map((collectionEntity) => collectionEntity.farmId);
        const miningFarmEntities = await this.findMiningFarmByIds(miningFarmIds);

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

        return miningFarmEntities;
    }

    async findMiningFarmById(id: number, tx: Transaction = undefined, lock: LOCK = undefined): Promise < MiningFarmEntity > {
        const miningFarmRepo = await this.miningFarmRepo.findByPk(id, {
            transaction: tx,
            lock,
        });
        return MiningFarmEntity.fromRepo(miningFarmRepo);
    }

    async findMiningFarmByIds(miningFarmIds: number[]): Promise < MiningFarmEntity[] > {
        const miningFarmRepo = await this.miningFarmRepo.findAll({
            where: {
                [MiningFarmRepoColumn.ID]: miningFarmIds,
            },
        });
        return miningFarmRepo.map((miningFarmRepo) => {
            return MiningFarmEntity.fromRepo(miningFarmRepo);
        });
    }

    async creditMiningFarm(miningFarmEntity: MiningFarmEntity, creditImages = true, tx: Transaction = undefined): Promise < MiningFarmEntity > {
        let newUris = [], oldUris = [];

        if (creditImages === true) {
            try {
                miningFarmEntity.coverImgUrl = await this.dataService.trySaveUri(miningFarmEntity.accountId, miningFarmEntity.coverImgUrl);
                miningFarmEntity.profileImgUrl = await this.dataService.trySaveUri(miningFarmEntity.accountId, miningFarmEntity.profileImgUrl);
                for (let i = miningFarmEntity.farmPhotoUrls.length; i-- > 0;) {
                    miningFarmEntity.farmPhotoUrls[i] = await this.dataService.trySaveUri(miningFarmEntity.accountId, miningFarmEntity.farmPhotoUrls[i]);
                }
            } catch (e) {
                throw new DataServiceError();
            }
            newUris = [miningFarmEntity.coverImgUrl, miningFarmEntity.profileImgUrl].concat(miningFarmEntity.farmPhotoUrls);
        }

        let miningFarmRepo = MiningFarmEntity.toRepo(miningFarmEntity);
        try {
            if (miningFarmEntity.isNew() === true) {
                miningFarmRepo = await this.miningFarmRepo.create(miningFarmRepo.toJSON(), {
                    returning: true,
                    transaction: tx,
                })
            } else {
                if (creditImages === true) {
                    const miningFarmRepoDb = await this.findMiningFarmById(miningFarmRepo.id, tx, tx.LOCK.UPDATE);
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
                    transaction: tx,
                })
                miningFarmRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
            }
            this.dataService.cleanUpOldUris(oldUris, newUris);
        } catch (ex) {
            this.dataService.cleanUpNewUris(oldUris, newUris);
            const errMessage = ex.response?.message;
            switch (errMessage) {
                case ERROR_TYPES.NOT_FOUND:
                    throw ex;
                default:
                    throw new FarmCreationError();
            }
        }

        return MiningFarmEntity.fromRepo(miningFarmRepo);
    }

    async findMiners(): Promise < MinerEntity[] > {
        const minerRepos = await this.minerRepo.findAll();
        return minerRepos.map((minerEntity) => {
            return MinerEntity.fromRepo(minerEntity);
        });
    }

    async findEnergySources(): Promise < EnergySourceEntity[] > {
        const energySourceRepos = await this.energySourceRepo.findAll();
        return energySourceRepos.map((energySourceRepo) => {
            return EnergySourceEntity.fromRepo(energySourceRepo);
        });
    }

    async findManufacturers(): Promise < ManufacturerEntity[] > {
        const manufacturerRepos = await this.manufacturerRepo.findAll();
        return manufacturerRepos.map((manufacturerRepo) => {
            return ManufacturerEntity.fromRepo(manufacturerRepo);
        })
    }

    async creditEnergySource(energySourceEntity: EnergySourceEntity, tx: Transaction = undefined): Promise < EnergySourceEntity > {
        let energySourceRepo = EnergySourceEntity.toRepo(energySourceEntity);
        if (energySourceEntity.isNew() === true) {
            energySourceRepo = await this.energySourceRepo.create(energySourceRepo.toJSON(), {
                returning: true,
                transaction: tx,
            })
        } else {
            const whereClause = new EnergySourceRepo();
            whereClause.id = energySourceRepo.id;
            const sqlResult = await this.energySourceRepo.update(energySourceRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereClause),
                returning: true,
                transaction: tx,
            })
            energySourceRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return EnergySourceEntity.fromRepo(energySourceRepo);
    }

    async creditMiner(minerEntity: MinerEntity, tx: Transaction = undefined): Promise < MinerEntity > {
        let minerRepo = MinerEntity.toRepo(minerEntity);
        if (minerEntity.isNew() === true) {
            console.log(2, minerRepo.toJSON());
            minerRepo = await this.minerRepo.create(minerRepo.toJSON(), {
                returning: true,
                transaction: tx,
            })
        } else {
            const whereClause = new MinerRepo();
            whereClause.id = minerRepo.id;
            const sqlResult = await this.minerRepo.update(minerRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereClause),
                returning: true,
                transaction: tx,
            })
            minerRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return MinerEntity.fromRepo(minerRepo);
    }

    async creditManufacturer(manufacturerEntity: ManufacturerEntity, tx: Transaction = undefined): Promise < ManufacturerEntity > {
        let manufacturerRepo = ManufacturerEntity.toRepo(manufacturerEntity);
        if (manufacturerEntity.isNew() === true) {
            manufacturerRepo = await this.manufacturerRepo.create(manufacturerRepo.toJSON(), {
                returning: true,
                transaction: tx,
            })
        } else {
            const whereClause = new MinerRepo();
            whereClause.id = manufacturerRepo.id;
            const sqlResult = await this.manufacturerRepo.update(manufacturerRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereClause),
                returning: true,
                transaction: tx,
            })
            manufacturerRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return ManufacturerEntity.fromRepo(manufacturerRepo);
    }

    async getDetails(farmId: number): Promise < MiningFarmDetailsEntity > {
        const miningFarmEntity = await this.findMiningFarmById(farmId)
        if (miningFarmEntity === null) {
            return null;
        }

        const collectionFilterEntity = new CollectionFilterEntity();
        collectionFilterEntity.farmId = farmId.toString();
        const { collectionEntities } = await this.collectionService.findByFilter(collectionFilterEntity);
        // Get number of total and sold NFTs
        const nftFilterEntity = new NftFilterEntity();
        nftFilterEntity.collectionIds = collectionEntities.map((entity) => entity.id.toString());
        const { nftEntities } = await this.nftService.findByFilter(null, nftFilterEntity);
        const soldNfts = nftEntities.filter((nft) => nft.tokenId !== '')

        // Calculate remaining hash power of the farm
        const collectionsHashPowerSum = collectionEntities.reduce((prevVal, currVal) => prevVal + Number(currVal.hashingPower), 0)
        const remainingHashPowerInTH = miningFarmEntity.hashPowerInTh - collectionsHashPowerSum;

        const { activeWorkersCount, averageHashRateH1 } = await this.getFoundryFarmWorkersDetails(miningFarmEntity.legalName);

        const miningFarmDetailsEntity = new MiningFarmDetailsEntity();
        miningFarmDetailsEntity.miningFarmId = miningFarmEntity.id;
        miningFarmDetailsEntity.averageHashPowerInTh = averageHashRateH1;
        miningFarmDetailsEntity.activeWorkers = activeWorkersCount;
        miningFarmDetailsEntity.nftsOwned = nftEntities.length;
        miningFarmDetailsEntity.totalNftsSold = soldNfts.length;
        miningFarmDetailsEntity.remainingHashPowerInTH = remainingHashPowerInTH;

        return miningFarmDetailsEntity;
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
