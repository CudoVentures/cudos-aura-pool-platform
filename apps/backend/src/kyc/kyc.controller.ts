import { Body, Controller, HttpCode, Put, Req, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import MiningFarmEntity from '../farm/entities/mining-farm.entity';
import NftEntity from '../nft/entities/nft.entity';
import { KycService } from './kyc.service';

@ApiTags('Kyc')
@Controller('kyc')
export class KycController {

    constructor(private kycService: KycService) {}

}
