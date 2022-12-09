import { Body, Controller, HttpCode, Put, Req, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import MiningFarmEntity from '../farm/entities/mining-farm.entity';
import { NftJsonValidator } from '../nft/nft.types';
import { ReqSignalVisitMiningFarm } from './dto/requests.dto';
import { VisitorService } from './visitor.service';
import { UUID_COOKIE_KEY } from './visitor.types';

@ApiTags('Visitor')
@Controller('visitor')
export class VisitorController {

    constructor(private visitorService: VisitorService) {}

    @UseInterceptors(TransactionInterceptor)
    @Put('signalVisitMiningFarm')
    @HttpCode(200)
    async signalVisitMiningFarm(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqSignalVisitMiningFarm: ReqSignalVisitMiningFarm,
    ): Promise < void > {
        const uuid = req.signedCookies[UUID_COOKIE_KEY];
        if (uuid === undefined) {
            return;
        }

        const miningFarmEntity = MiningFarmEntity.fromJson(reqSignalVisitMiningFarm.miningFarmEntity);
        this.visitorService.signalVisitFarm(miningFarmEntity.id, uuid, req.transaction);
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('signalVisitNft')
    @HttpCode(200)

    async signalVisitNft(@Req() req: AppRequest, @Body() nftDto: NftJsonValidator): Promise < void > {
        const uuid = req.signedCookies[UUID_COOKIE_KEY];
        if (uuid === undefined) {
            return;
        }

        this.visitorService.signalVisitNft(nftDto.id, uuid, req.transaction);
    }

}
