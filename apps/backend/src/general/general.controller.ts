import { Body, Controller, Get, Put, Req, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { UpdateLastCheckedBlockRequest } from './dto/update-last-checked-height-request.dto';
import GeneralService from './general.service';

@ApiTags('GENERAL')
@Controller('general')
export class GeneralController {
    constructor(private generalService: GeneralService) {
    }

    @Get('heartbeat')
    async getAlive(): Promise<any> {
        return {};
    }

    @Get('last-checked-block')
    async getLastCheckedBlock(): Promise<number> {
        return this.generalService.getLastCheckedBlock();
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('last-checked-block')
    async updateLastCheckedBlock(
        @Req() req: AppRequest,
        @Body() updateLastCheckedBlockRequest: UpdateLastCheckedBlockRequest,
    ): Promise<any> {
        return this.generalService.setLastCheckedBlock(updateLastCheckedBlockRequest.height);
    }
}
