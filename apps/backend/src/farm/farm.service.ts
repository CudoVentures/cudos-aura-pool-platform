import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Collection } from '../collection/collection.model';
import { NFT } from '../nft/nft.model';
import { NftStatus } from '../nft/nft.types';
import { EnergySourceDto } from './dto/energy-source.dto';
import { FarmDto } from './dto/farm.dto';
import { ManufacturerDto } from './dto/manufacturer.dto';
import { MinerDto } from './dto/miner.dto';
import { EnergySource } from './models/energy-source.model';
import { Farm } from './models/farm.model';
import { Manufacturer } from './models/manufacturer.model';
import { Miner } from './models/miner.model';
import { FarmStatus } from './utils';
import { HttpService } from '@nestjs/axios';
import { CollectionStatus } from '../collection/utils';
import MiningFarmFilterModel from './dto/farm-filter.mdel';
import sequelize, { Op } from 'sequelize';
import { User } from '../user/user.model';
import { VisitorService } from '../visitor/visitor.service';

@Injectable()
export class FarmService {
    constructor(
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
    ) {}

    async findByFilter(user: User, miningFarmFilterModel: MiningFarmFilterModel): Promise < { miningFarmEntities: Farm[], total: number } > {
        let whereClause: any = {};

        if (miningFarmFilterModel.hasMiningFarmIds() === true) {
            whereClause.id = miningFarmFilterModel.miningFarmIds;
        }

        if (miningFarmFilterModel.hasMiningFarmStatus() === true) {
            whereClause.status = miningFarmFilterModel.getMiningFarmStatus();
        }

        if (miningFarmFilterModel.inOnlyForSessionAccount() === true) {
            whereClause.creator_id = user.id;
        }

        if (miningFarmFilterModel.hasSearchString() === true) {
            whereClause = [
                whereClause,
                sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), { [Op.like]: `%${miningFarmFilterModel.searchString.toLowerCase()}%` }),
            ]
        }

        let miningFarmEntities = await this.farmModel.findAll({
            where: whereClause,
        });

        if (miningFarmFilterModel.isSortByPopular() === true) {
            const miningFarmIds = miningFarmEntities.map((miningFarm) => {
                return miningFarm.id;
            });
            const sortDirection = Math.floor(Math.abs(miningFarmFilterModel.orderBy) / miningFarmFilterModel.orderBy);
            const visitorMap = await this.visitorService.fetchMiningFarmVisitsCount(miningFarmIds);
            miningFarmEntities.sort((a: Farm, b: Farm) => {
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

    async findOne(id: number): Promise<Farm> {
        return this.farmModel.findByPk(id);
    }

    async findByCreatorId(id: number): Promise<Farm[]> {
        const farms = await this.farmModel.findAll({
            where: {
                creator_id: id,
            },
        });

        return farms;
    }

    async createOne(
        createFarmDto: FarmDto,
        creator_id: number,
    ): Promise<Farm> {
        const farm = this.farmModel.create({
            ...createFarmDto,
            creator_id,
            status: FarmStatus.QUEUED,
        });

        return farm;
    }

    async updateOne(
        id: number,
        updateFarmDto: FarmDto,
    ): Promise<Farm> {
        const [count, [farm]] = await this.farmModel.update({ ...updateFarmDto }, {
            where: { id },
            returning: true,
        });

        return farm;
    }

    async deleteOne(id: number): Promise<Farm> {
        const [count, [farm]] = await this.farmModel.update(
            { deleted_at: new Date() },
            {
                where: {
                    id,
                },
                returning: true,
            },
        );

        return farm;
    }

    async updateStatus(id: number, status: FarmStatus): Promise<Farm> {
        const [count, [farm]] = await this.farmModel.update(
            {
                status,
            },
            {
                where: { id },
                returning: true,
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

    async createMiner(minerDto: MinerDto): Promise<Miner> {
        const miner = await this.minerModel.create({ ...minerDto });

        return miner;
    }

    async createEnergySource(energySourceDto: EnergySourceDto): Promise<EnergySource> {
        const energySource = await this.energySourceModel.create({ ...energySourceDto });

        return energySource;
    }

    async createManufacturer(manufacturerDto: ManufacturerDto): Promise<Manufacturer> {
        const manufacturer = await this.manufacturerModel.create({ ...manufacturerDto });

        return manufacturer;
    }

    async updateMiner(minerDto: MinerDto): Promise<Miner> {
        const { id, ...rest } = minerDto
        const [count, [miner]] = await this.minerModel.update({ ...rest }, { where: { id }, returning: true })

        return miner;
    }

    async updateEnergySource(energySourceDto: EnergySourceDto): Promise<EnergySource> {
        const { id, ...rest } = energySourceDto
        const [count, [energySource]] = await this.energySourceModel.update({ ...rest }, { where: { id }, returning: true })

        return energySource;
    }

    async updateManufacturer(manufacturerDto: ManufacturerDto): Promise<Manufacturer> {
        const { id, ...rest } = manufacturerDto
        const [count, [manufacturer]] = await this.manufacturerModel.update({ ...rest }, { where: { id }, returning: true })

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
