import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VisitorController } from './visitor.controller';
import { VisitorEntity } from './visitor.entity';
import { VisitorService } from './visitor.service';

@Module({
    imports: [
        SequelizeModule.forFeature([VisitorEntity]),
    ],
    providers: [VisitorService],
    controllers: [VisitorController],
    exports: [VisitorModule, VisitorService],
})
export class VisitorModule {}
