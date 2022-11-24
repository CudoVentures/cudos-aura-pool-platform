import { Body, Controller, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FarmDto } from '../farm/dto/farm.dto';
import { NFTDto } from '../nft/dto/nft.dto';
import { VisitorService } from './visitor.service';
import { UUID_COOKIE_KEY } from './visitor.types';

@ApiTags('Visitor')
@Controller('visitor')
export class VisitorController {

    constructor(private visitorService: VisitorService) {}

    @Put('signalVisitMiningFarm')
    async signalVisitMiningFarm(@Request() req, @Body() farmDto: FarmDto): Promise < void > {
        const uuid = req.signedCookies[UUID_COOKIE_KEY];
        if (uuid === undefined) {
            return;
        }

        this.visitorService.signalVisitFarm(farmDto.id, uuid);
    }

    @Put('signalVisitNft')
    async signalVisitNft(@Request() req, @Body() nftDto: NFTDto): Promise < void > {
        const uuid = req.signedCookies[UUID_COOKIE_KEY];
        if (uuid === undefined) {
            return;
        }

        this.visitorService.signalVisitNft(nftDto.id, uuid);
    }

}
