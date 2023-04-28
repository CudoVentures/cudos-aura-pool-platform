import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { GeneralController } from './general.controller';
import GeneralService from './general.service';
import { GeneralRepo } from './repos/general.repo';
import SettingsRepo from './repos/settings.repo';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        SequelizeModule.forFeature([GeneralRepo, SettingsRepo]),
        HttpModule,
    ],
    providers: [GeneralService],
    controllers: [GeneralController],
    exports: [GeneralService],
})
export class GeneralModule {}
