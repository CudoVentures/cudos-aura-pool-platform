import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { GeneralController } from './general.controller';
import GeneralService from './general.service';
import { GeneralRepo } from './repos/general.repo';

@Module({
    imports: [
        SequelizeModule.forFeature([GeneralRepo]),
    ],
    providers: [GeneralService],
    controllers: [GeneralController],
    exports: [GeneralService],
})
export class GeneralModule {}
