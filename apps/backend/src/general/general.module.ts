import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { GeneralController } from './general.controller';
import GeneralService from './general.service';
import { GeneralRepo } from './repos/general.repo';
import SettingsRepo from './repos/settings.repo';

@Module({
    imports: [
        SequelizeModule.forFeature([GeneralRepo, SettingsRepo]),
    ],
    providers: [GeneralService],
    controllers: [GeneralController],
    exports: [GeneralService],
})
export class GeneralModule {}
