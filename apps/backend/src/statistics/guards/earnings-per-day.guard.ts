import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AppRequest } from '../../common/commont.types';
import { FarmService } from '../../farm/farm.service';
import { ReqFetchEarningsPerDay } from '../dto/requests.dto';

@Injectable()
export class EarningsPerDayGuard {

    constructor(private farmService: FarmService) {}

    async canActivate(request: AppRequest, req: ReqFetchEarningsPerDay): Promise < boolean > {
        // const request = context.switchToHttp().getRequest<AppRequest>();
        const { sessionAdminEntity, sessionSuperAdminEntity } = request;

        if (sessionSuperAdminEntity !== null) {
            return;
        }

        if (sessionAdminEntity !== null) {
            // const req = await (new ValidationPipe({ transform: true }).transform(body, {
            //     type: 'body',
            //     metatype: ReqFetchEarningsPerDay,
            // })) as ReqFetchEarningsPerDay;
            const farmId = parseInt(req.earningsPerDayFilterEntity.farmId);

            const miningFarmDb = await this.farmService.findMiningFarmById(farmId, request.transaction);
            if (miningFarmDb?.accountId === sessionAdminEntity.accountId) {
                return;
            }
        }

        throw new UnauthorizedException();
    }
}
