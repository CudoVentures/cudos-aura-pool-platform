import { Module } from '@nestjs/common';
import { GeneralController } from './general.controller';

@Module({
    imports: [],
    providers: [],
    controllers: [GeneralController],
    exports: [],
})
export class GeneralModule {}
