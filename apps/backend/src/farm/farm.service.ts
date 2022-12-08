import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Collection } from '../collection/collection.model';
import { NFT } from '../nft/nft.model';
import { NftStatus } from '../nft/nft.types';
import { EnergySourceDto } from './dto/energy-source.dto';
import { ManufacturerDto } from './dto/manufacturer.dto';
import { MinerDto } from './dto/miner.dto';
import { EnergySource } from './models/energy-source.model';
import { Farm } from './models/farm.model';
import { Manufacturer } from './models/manufacturer.model';
import { Miner } from './models/miner.model';
import { HttpService } from '@nestjs/axios';
import { CollectionStatus } from '../collection/utils';
import MiningFarmFilterModel from './dto/farm-filter.mdel';
import sequelize, { LOCK, Op, Transaction } from 'sequelize';
import { VisitorService } from '../visitor/visitor.service';
import AccountEntity from '../account/entities/account.entity';
import { UpdateFarmStatusDto } from './dto/update-status.dto';
import { FarmStatus } from './farm.types';
import MiningFarmEntity from './entities/mining-farm.entity';
import { MiningFarmRepo, MiningFarmRepoColumn } from './repos/mining-farm.repo';
import AppRepo from '../common/repo/app.repo';
import DataService from '../data/data.service';
import { DataServiceError } from '../common/errors/errors';

@Injectable()
export class FarmService {
    constructor(
        @InjectModel(MiningFarmRepo)
        private miningFarmRepo: typeof MiningFarmRepo,
        @InjectModel(Farm)
        private farmModel: typeof Farm,
        @InjectModel(Collection)
        private collectionModel: typeof Collection,
        @InjectModel(NFT)
        private nftModel: typeof NFT,
        @InjectModel(Manufacturer)
        private manufacturerModel: typeof Manufacturer,
        @InjectModel(Miner)
        private minerModel: typeof Miner,
        @InjectModel(EnergySource)
        private energySourceModel: typeof EnergySource,
        private httpService: HttpService,
        private visitorService: VisitorService,
        private dataService: DataService,
    ) {}

    async findByFilter(accountEntity: AccountEntity, miningFarmFilterModel: MiningFarmFilterModel): Promise < { miningFarmEntities: MiningFarmEntity[], total: number } > {
        let whereClause: any = {};

        if (miningFarmFilterModel.hasMiningFarmIds() === true) {
            whereClause[MiningFarmRepoColumn.ID] = miningFarmFilterModel.miningFarmIds;
        }

        if (miningFarmFilterModel.hasMiningFarmStatus() === true) {
            whereClause[MiningFarmRepoColumn.STATUS] = miningFarmFilterModel.getMiningFarmStatus();
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

    async findMiningFarmById(id: number, tx: Transaction = undefined, lock: LOCK = undefined): Promise < MiningFarmEntity > {
        const miningFarmRepo = await this.miningFarmRepo.findByPk(id, {
            transaction: tx,
            lock,
        });
        return MiningFarmEntity.fromRepo(miningFarmRepo);
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
            throw ex;
        }

        return MiningFarmEntity.fromRepo(miningFarmRepo);
    }

    async findOne(id: number, tx: Transaction = undefined, lock: LOCK = undefined): Promise<Farm> {
        return this.farmModel.findByPk(id, {
            transaction: tx,
            lock,
        });
    }

    async updateStatus(id: number, updateFarmStatusDto: UpdateFarmStatusDto, tx: Transaction = undefined): Promise<Farm> {

        console.log('-------------------------------------------')
        console.log(updateFarmStatusDto)
        console.log('-------------------------------------------')

        const [count, [farm]] = await this.farmModel.update(
            updateFarmStatusDto,
            {
                where: { id },
                returning: true,
                transaction: tx,
            },
        );

        return farm;
    }

    async findMiners(): Promise<Miner[]> {
        const miners = await this.minerModel.findAll();

        return miners;
    }

    async findEnergySources(): Promise<EnergySource[]> {
        const miners = await this.energySourceModel.findAll();

        return miners;
    }

    async findManufacturers(): Promise<Manufacturer[]> {
        const miners = await this.manufacturerModel.findAll();

        return miners;
    }

    async createMiner(minerDto: MinerDto, tx: Transaction = undefined): Promise<Miner> {
        const miner = await this.minerModel.create({ ...minerDto }, { transaction: tx });

        return miner;
    }

    async createEnergySource(energySourceDto: EnergySourceDto, tx: Transaction = undefined): Promise<EnergySource> {
        const energySource = await this.energySourceModel.create({ ...energySourceDto }, { transaction: tx });

        return energySource;
    }

    async createManufacturer(manufacturerDto: ManufacturerDto, tx: Transaction = undefined): Promise<Manufacturer> {
        const manufacturer = await this.manufacturerModel.create({ ...manufacturerDto }, { transaction: tx });

        return manufacturer;
    }

    async updateMiner(minerDto: MinerDto, tx: Transaction = undefined): Promise<Miner> {
        const { id, ...rest } = minerDto
        const [count, [miner]] = await this.minerModel.update({ ...rest }, { where: { id }, returning: true, transaction: tx })

        return miner;
    }

    async updateEnergySource(energySourceDto: EnergySourceDto, tx: Transaction = undefined): Promise<EnergySource> {
        const { id, ...rest } = energySourceDto
        const [count, [energySource]] = await this.energySourceModel.update({ ...rest }, { where: { id }, returning: true, transaction: tx })

        return energySource;
    }

    async updateManufacturer(manufacturerDto: ManufacturerDto, tx: Transaction = undefined): Promise<Manufacturer> {
        const { id, ...rest } = manufacturerDto
        const [count, [manufacturer]] = await this.manufacturerModel.update({ ...rest }, { where: { id }, returning: true, transaction: tx })

        return manufacturer;
    }

    async getDetails(farmId: number): Promise <{ id: number, subAccountName: string, totalHashRate: number, nftsOwned: number, nftsSold: number, remainingHashPowerInTH: number }> {
        const farm = await this.farmModel.findByPk(farmId)
        if (!farm) {
            throw new NotFoundException(`Farm with id '${farmId}' doesn't exist`)
        }

        const collections = await this.collectionModel.findAll({ where: { farm_id: farmId, status: { [Op.notIn]: [CollectionStatus.DELETED] } } })

        // Get number of total and sold NFTs
        const nfts = await this.nftModel.findAll({ include: [{ model: Collection, where: { farm_id: farmId } }], where: { status: { [Op.notIn]: [NftStatus.REMOVED] } } })
        const soldNfts = nfts.filter((nft) => nft.token_id !== '')

        // Calculate remaining hash power of the farm
        const collectionsHashPowerSum = collections.reduce((prevVal, currVal) => prevVal + Number(currVal.hashing_power), 0)
        const remainingHashPowerInTH = farm.total_farm_hashrate - collectionsHashPowerSum

        return {
            id: farmId,
            subAccountName: farm.sub_account_name,
            totalHashRate: farm.total_farm_hashrate,
            nftsOwned: nfts.length,
            nftsSold: soldNfts.length,
            remainingHashPowerInTH,
        }
    }

    async getFoundryFarmWorkersDetails(subAccountName: string): Promise<{ activeWorkersCount: number, averageHashRateH1: number }> {
        // TODO: Iterate if there are more than 100 workers
        try {
            const res = await this.httpService.axiosRef.get(`${process.env.App_Foundry_API}/subaccount_stats/${subAccountName}`, {
                headers: {
                    'x-api-key': process.env.App_Foundry_API_Auth_Token,
                },
            });

            const workersDetails = {
                activeWorkersCount: res.data.activeWorkers,
                averageHashRateH1: res.data.hashrate1hrAvg,
            };

            return workersDetails;
        } catch (err) {
            const workersDetails = {
                activeWorkersCount: 0,
                averageHashRateH1: 0,
            };

            return workersDetails
        }
    }

    private readonly foundryWorkersDetailsURI = 'coin=BTC&sort=highestHashrate&status=all&tag=all&pageNumber=0&pageSize=100&workerNameSearchStr=';
}
