import { Body, Controller, HttpCode, Put, Req, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import MiningFarmEntity from '../farm/entities/mining-farm.entity';
import NftEntity from '../nft/entities/nft.entity';
import { ReqSignalVisitMiningFarm, ReqSignalVisitNft } from './dto/requests.dto';
import { VisitorService } from './visitor.service';
import { UUID_COOKIE_KEY } from './visitor.types';

@Controller('visitor')
export class VisitorController {

    constructor(private visitorService: VisitorService) {}

    @Put('signalVisitMiningFarm')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(20, 30)
    async signalVisitMiningFarm(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqSignalVisitMiningFarm: ReqSignalVisitMiningFarm,
    ): Promise < void > {
        const uuid = req.signedCookies[UUID_COOKIE_KEY];
        if (uuid === undefined) {
            return;
        }

        const miningFarmEntity = MiningFarmEntity.fromJson(reqSignalVisitMiningFarm.miningFarmEntity);
        await this.visitorService.signalVisitFarm(miningFarmEntity.id, uuid.toString(), req.transaction);
    }

    @Put('signalVisitNft')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(20, 30)
    async signalVisitNft(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqSignalVisitNft: ReqSignalVisitNft,
    ): Promise < void > {
        const uuid = req.signedCookies[UUID_COOKIE_KEY];
        if (uuid === undefined) {
            return;
        }

        const nftEntity = NftEntity.fromJson(reqSignalVisitNft.nftEntity);
        await this.visitorService.signalVisitNft(nftEntity.id, uuid.toString(), req.transaction);
    }

}
