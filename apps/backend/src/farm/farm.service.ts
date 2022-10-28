import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { Farm } from './farm.model';
import { FarmStatus } from './utils';

@Injectable()
export class FarmService {
    constructor(
    @InjectModel(Farm)
    private farmModel: typeof Farm,
    ) {}

    async findAll(): Promise<Farm[]> {
        const farms = await this.farmModel.findAll();

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
        createFarmDto: CreateFarmDto,
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
        updateFarmDto: Partial<UpdateFarmDto>,
    ): Promise<Farm> {
        const [count, [farm]] = await this.farmModel.update(updateFarmDto, {
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
}
