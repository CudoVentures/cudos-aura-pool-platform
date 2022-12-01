import { Body, Controller, Put, Req, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { FarmDto } from '../farm/dto/farm.dto';
import { NFTDto } from '../nft/dto/nft.dto';
import { VisitorService } from './visitor.service';
import { UUID_COOKIE_KEY } from './visitor.types';

@ApiTags('Visitor')
@Controller('visitor')
export class VisitorController {

    constructor(private visitorService: VisitorService) {}

    @UseInterceptors(TransactionInterceptor)
    @Put('signalVisitMiningFarm')
    async signalVisitMiningFarm(@Req() req: AppRequest, @Body() farmDto: FarmDto): Promise < void > {
        const uuid = req.signedCookies[UUID_COOKIE_KEY];
        if (uuid === undefined) {
            return;
        }

        this.visitorService.signalVisitFarm(farmDto.id, uuid, req.transaction);
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('signalVisitNft')
    async signalVisitNft(@Req() req: AppRequest, @Body() nftDto: NFTDto): Promise < void > {
        const uuid = req.signedCookies[UUID_COOKIE_KEY];
        if (uuid === undefined) {
            return;
        }

        this.visitorService.signalVisitNft(nftDto.id, uuid, req.transaction);
    }

}
