import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AllowlistController } from './allowlist.controller';
import AllowlistService from './allowlist.service';

@Module({
    imports: [HttpModule],
    providers: [AllowlistService],
    controllers: [AllowlistController],
    exports: [AllowlistService],
})
export class AllowlistModule {}
