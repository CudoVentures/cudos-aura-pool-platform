import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateLastCheckedBlockRequest } from './dto/update-last-checked-height-request.dto';

@ApiTags('GENERAL')
@Controller('general')
export class GeneralController {
    constructor() {}

    @Get('heartbeat')
    async getAlive(): Promise<any> {
        return {};
    }

    @Get('last-checked-block')
    async getLastCheckedBlock(): Promise<any> {
        return { height: 1000 };
    }

    @Put('last-checked-block')
    async updatelastCheckedBlock(@Body() updateLastCheckedBlockRequest: UpdateLastCheckedBlockRequest): Promise<any> {
        return {};
    }
}
