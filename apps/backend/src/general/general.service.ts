import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GeneralRepo, GENERAL_REPO_PK } from './repos/general.repo';
import SettingsEntity from './entities/settings.entity';
import { Transaction } from 'sequelize';
import SettingsRepo, { SETTINGS_REPO_PK } from './repos/settings.repo';
import AppRepo from '../common/repo/app.repo';
import { ConfigService } from '@nestjs/config';
import GeneralEntity from './entities/general.entity';

@Injectable()
export default class GeneralService {

    dev: boolean;
    production: boolean;

    constructor(
        @InjectModel(GeneralRepo)
        private generalRepo: typeof GeneralRepo,
        @InjectModel(SettingsRepo)
        private settingsRepo: typeof SettingsRepo,
        private configService: ConfigService,
    ) {
        this.dev = (this.configService.get < string >('APP_ENV') ?? 'dev') === 'dev';
        this.production = (this.configService.get < string >('APP_ENV') ?? 'dev') === 'production';
    }

    async getLastCheckedBlock(): Promise < number > {
        const generalEntity = await this.fetchGeneral();
        return generalEntity.lastCheckedBlock;
    }

    async setLastCheckedPaymentRelayerBlocks(lastCheckedEthBlock: number, lastCheckedCudosBlock: number): Promise < void > {
        let generalEntity = await this.fetchGeneral();
        if (lastCheckedEthBlock !== null) {
            generalEntity.lastCheckedPaymentRelayerEthBlock = lastCheckedEthBlock;
        }
        if (lastCheckedCudosBlock !== null) {
            generalEntity.lastCheckedPaymentRelayerCudosBlock = lastCheckedCudosBlock;
        }
        generalEntity = await this.creditGeneral(generalEntity);
    }

    async setLastCheckedBlock(lastCheckedBlock: number): Promise < void > {
        let generalEntity = await this.fetchGeneral();
        generalEntity.lastCheckedBlock = lastCheckedBlock;
        generalEntity = await this.creditGeneral(generalEntity);
    }

    async fetchGeneral(): Promise < GeneralEntity > {
        const generalRepo = await this.generalRepo.findByPk(GENERAL_REPO_PK);
        return GeneralEntity.fromRepo(generalRepo);
    }

    async fetchSettings(): Promise < SettingsEntity > {
        const settingsRepo = await this.settingsRepo.findByPk(SETTINGS_REPO_PK);
        return SettingsEntity.fromRepo(settingsRepo);
    }

    async creditGeneral(generalEntity: GeneralEntity, tx: Transaction = undefined): Promise < GeneralEntity > {
        let generalRepo = GeneralEntity.toRepo(generalEntity);
        const whereGeneralRepo = new GeneralRepo();
        whereGeneralRepo.id = GENERAL_REPO_PK;
        const sqlResult = await this.generalRepo.update(generalRepo.toJSON(), {
            where: AppRepo.toJsonWhere(whereGeneralRepo),
            returning: true,
            transaction: tx,
        });
        generalRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;

        return GeneralEntity.fromRepo(generalRepo);
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

    isDev() {
        return this.dev;
    }

    isProduction() {
        return this.production;
    }
}
