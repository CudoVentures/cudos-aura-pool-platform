import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Collection } from '../collection/collection.model';
import { NFT } from '../nft/nft.model';
import { NftStatus } from '../nft/utils';
import { EnergySourceDto } from './dto/energy-source.dto';
import { FarmDto } from './dto/farm.dto';
import { ManufacturerDto } from './dto/manufacturer.dto';
import { MinerDto } from './dto/miner.dto';
import { EnergySource } from './models/energy-source.model';
import { Farm } from './models/farm.model';
import { Manufacturer } from './models/manufacturer.model';
import { Miner } from './models/miner.model';
import { FarmFilters, FarmStatus } from './utils';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { FoundryWorkersDetails } from './dto/foundry-workers-details.dto';

@Injectable()
export class FarmService {
    constructor(
    @InjectModel(Farm)
    private farmModel: typeof Farm,
    @InjectModel(NFT)
    private nftModel: typeof NFT,
    @InjectModel(Manufacturer)
    private manufacturerModel: typeof Manufacturer,
    @InjectModel(Miner)
    private minerModel: typeof Miner,
    @InjectModel(EnergySource)
    private energySourceModel: typeof EnergySource,
    private httpService: HttpService,
    ) {}

    async findAll(filters: FarmFilters): Promise<Farm[]> {
        const { limit, offset, order_by, ...rest } = filters

        let order;
        switch (order_by) {
            // TODO: SORT BY POPULARITY
            // case FarmOrderBy.POPULAR_DESC:
            //     order = [['createdAt', 'DESC']]
            //     break;
            default:
                order = undefined;
                break;

        }

        const farms = await this.farmModel.findAll({ where: { ...rest }, order, offset, limit });

        return farms;
    }

    async findOne(id: number): Promise<Farm> {
        const farm = await this.farmModel.findByPk(id);

        if (!farm) {
            throw new NotFoundException();
        }

        return farm
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
        console.log(updateFarmDto);

        const [count, [farm]] = await this.farmModel.update({ ...updateFarmDto, status: FarmStatus.QUEUED }, {
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

    async getDetails(farmId: number): Promise <{ id: number, subAccountName: string, totalHashRate: number, nftsOwned: number, nftsSold: number }> {
        const farm = await this.farmModel.findByPk(farmId)
        const nfts = await this.nftModel.findAll({ include: [{ model: Collection, where: { farm_id: farmId } }] })
        const minted = nfts.filter((nft) => nft.status === NftStatus.MINTED)

        return {
            id: farmId,
            subAccountName: farm.sub_account_name,
            totalHashRate: farm.total_farm_hashrate,
            nftsOwned: nfts.length,
            nftsSold: minted.length,
        }
    }

    async getFoundryFarmWorkersDetails(subAccountName: string): Promise<{ activeWorkersCount: number, averageHashRateH1: number }> {
        // TODO: Iterate if there are more than 100 workers
        const res: AxiosResponse<{ data: FoundryWorkersDetails }> = await this.httpService.axiosRef.get(`${process.env.App_Foundry_API}/workers/${subAccountName}?${this.foundryWorkersDetailsURI}`, {
            headers: {
                'x-api-key': process.env.App_Foundry_API_Auth_Token,
            },
        });

        if (!res.data.data.workersList.length || !res.data.data.totalWorkerCount) {
            throw new NotFoundException();
        }

        const workersDetails = {
            activeWorkersCount: res.data.data.totalWorkerCount,
            averageHashRateH1: 0,
        };

        res.data.data.workersList.forEach((worker) => {
            workersDetails.averageHashRateH1 += worker.hashrate_1h;
        });

        workersDetails.averageHashRateH1 /= workersDetails.activeWorkersCount;

        return workersDetails;
    }

    private readonly foundryWorkersDetailsURI = 'coin=BTC&sort=highestHashrate&status=all&tag=all&pageNumber=0&pageSize=100&workerNameSearchStr=';
}
