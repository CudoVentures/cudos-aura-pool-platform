import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GeneralRepo } from './repos/general.repo';

@Injectable()
export default class GeneralService {

    constructor(
        @InjectModel(GeneralRepo)
        private generalRepo: typeof GeneralRepo,
    ) {}

    async getLastCheckedBlock(): Promise < number > {
        const data = await this.generalRepo.findOne();

        return data.lastCheckedBlock;
    }

    async setLastCheckedBlock(lastCheckedBlock: number): Promise < void > {
        await this.generalRepo.update({ lastCheckedBlock }, { where: { } });
    }
}
