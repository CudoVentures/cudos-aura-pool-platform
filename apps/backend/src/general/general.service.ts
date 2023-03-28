import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GeneralRepo, GENERAL_REPO_PK } from './repos/general.repo';
import SettingsEntity from './entities/settings.entity';
import { LOCK, Transaction } from 'sequelize';
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

    async getLastCheckedBlock(dbTx: Transaction, dbLock: LOCK = undefined): Promise < number > {
        const generalEntity = await this.fetchGeneral(dbTx, dbLock);
        return generalEntity.lastCheckedBlock;
    }

    async setLastCheckedPaymentRelayerBlocks(lastCheckedEthBlock: number, lastCheckedCudosBlock: number, dbTx: Transaction): Promise < void > {
        let generalEntity = await this.fetchGeneral(dbTx, dbTx.LOCK.UPDATE);
        if (lastCheckedEthBlock !== null) {
            generalEntity.lastCheckedPaymentRelayerEthBlock = lastCheckedEthBlock;
        }
        if (lastCheckedCudosBlock !== null) {
            generalEntity.lastCheckedPaymentRelayerCudosBlock = lastCheckedCudosBlock;
        }
        generalEntity = await this.creditGeneral(generalEntity, dbTx);
    }

    async setLastCheckedBlock(lastCheckedBlock: number, dbTx: Transaction): Promise < void > {
        let generalEntity = await this.fetchGeneral(dbTx, dbTx.LOCK.UPDATE);
        generalEntity.lastCheckedBlock = lastCheckedBlock;
        generalEntity = await this.creditGeneral(generalEntity, dbTx);
    }

    async fetchGeneral(dbTx: Transaction, dbLock: LOCK = undefined): Promise < GeneralEntity > {
        const generalRepo = await this.generalRepo.findByPk(GENERAL_REPO_PK, {
            transaction: dbTx,
            lock: dbLock,
        });
        return GeneralEntity.fromRepo(generalRepo);
    }

    async fetchSettings(dbTx: Transaction, dbLock: LOCK = undefined): Promise < SettingsEntity > {
        const settingsRepo = await this.settingsRepo.findByPk(SETTINGS_REPO_PK, {
            transaction: dbTx,
            lock: dbLock,
        });
        return SettingsEntity.fromRepo(settingsRepo);
    }

    async creditGeneral(generalEntity: GeneralEntity, dbTx: Transaction): Promise < GeneralEntity > {
        let generalRepo = GeneralEntity.toRepo(generalEntity);
        const whereGeneralRepo = new GeneralRepo();
        whereGeneralRepo.id = GENERAL_REPO_PK;
        const sqlResult = await this.generalRepo.update(generalRepo.toJSON(), {
            where: AppRepo.toJsonWhere(whereGeneralRepo),
            returning: true,
            transaction: dbTx,
        });
        generalRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;

        return GeneralEntity.fromRepo(generalRepo);
    }

    async creditSettings(settingsEntity: SettingsEntity, dbTx: Transaction): Promise < SettingsEntity > {
        let settingsRepo = SettingsEntity.toRepo(settingsEntity);
        const whereSettingsRepo = new SettingsRepo();
        whereSettingsRepo.id = SETTINGS_REPO_PK;
        const sqlResult = await this.settingsRepo.update(settingsRepo.toJSON(), {
            where: AppRepo.toJsonWhere(whereSettingsRepo),
            returning: true,
            transaction: dbTx,
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
