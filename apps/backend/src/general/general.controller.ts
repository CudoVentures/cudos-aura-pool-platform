import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateLastCheckedBlockRequest } from './dto/update-last-checked-height-request.dto';

@ApiTags('GENERAL')
@Controller('general')
export class GeneralController {
    height: number;

    constructor() {
        this.height = 1110000
    }

    @Get('heartbeat')
    async getAlive(): Promise<any> {
        return {};
    }

    @Get('last-checked-block')
    async getLastCheckedBlock(): Promise<any> {
        return { height: this.height };
    }

    @Put('last-checked-block')
    async updatelastCheckedBlock(@Body() updateLastCheckedBlockRequest: UpdateLastCheckedBlockRequest): Promise<any> {
        this.height = updateLastCheckedBlockRequest.height;
        return {};
    }
}
