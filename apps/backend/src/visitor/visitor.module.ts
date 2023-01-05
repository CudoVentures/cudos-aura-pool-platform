import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VisitorController } from './visitor.controller';
import VisitorRepo from './repo/visitor.repo';
import { VisitorService } from './visitor.service';

@Module({
    imports: [
        SequelizeModule.forFeature([VisitorRepo]),
    ],
    providers: [VisitorService],
    controllers: [VisitorController],
    exports: [VisitorService],
})
export class VisitorModule {}
