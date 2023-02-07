import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import KycRepo from './repo/kyc.repo';

@Module({
    imports: [
        SequelizeModule.forFeature([KycRepo]),
    ],
    providers: [KycService],
    controllers: [KycController],
    exports: [KycService],
})
export class KycModule {}
