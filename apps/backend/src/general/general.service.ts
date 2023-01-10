import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GeneralRepo } from './repos/general.repo';
import SettingsEntity from './entities/settings.entity';
import { Transaction } from 'sequelize';
import SettingsRepo, { SETTINGS_REPO_PK } from './repos/settings.repo';
import AppRepo from '../common/repo/app.repo';

@Injectable()
export default class GeneralService {

    constructor(
        @InjectModel(GeneralRepo)
        private generalRepo: typeof GeneralRepo,
        @InjectModel(SettingsRepo)
        private settingsRepo: typeof SettingsRepo,
    ) {}

    async getLastCheckedBlock(): Promise < number > {
        const data = await this.generalRepo.findOne();

        return data.lastCheckedBlock;
    }

    async setLastCheckedBlock(lastCheckedBlock: number): Promise < void > {
        await this.generalRepo.update({ lastCheckedBlock }, { where: { } });
    }

    async fetchSettings(): Promise < SettingsEntity > {
        const settingsRepo = await this.settingsRepo.findByPk(SETTINGS_REPO_PK);
        return SettingsEntity.fromRepo(settingsRepo);
    }

    async creditSettings(settingsEntity: SettingsEntity, tx: Transaction = undefined): Promise < SettingsEntity > {
        let settingsRepo = SettingsEntity.toRepo(settingsEntity);
        const whereSettingsRepo = new SettingsRepo();
        whereSettingsRepo.id = SETTINGS_REPO_PK;
        const sqlResult = await this.settingsRepo.update(settingsRepo.toJSON(), {
            where: AppRepo.toJsonWhere(whereSettingsRepo),
            returning: true,
            transaction: tx,
        });
        settingsRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;

        return SettingsEntity.fromRepo(settingsRepo);
    }
}
