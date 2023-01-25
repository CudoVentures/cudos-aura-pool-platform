import { CanActivate, ExecutionContext, Injectable, ValidationPipe } from '@nestjs/common';
import { RequestWithSessionAccounts } from '../../common/commont.types';
import { FarmService } from '../../farm/farm.service';
import { ReqFetchEarningsPerDay } from '../dto/requests.dto';

@Injectable()
export class EarningsPerDayGuard implements CanActivate {

    constructor(private farmService: FarmService) {}

    async canActivate(context: ExecutionContext): Promise < boolean > {
        const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();
        const { sessionAdminEntity, sessionSuperAdminEntity, body } = request;

        if (sessionSuperAdminEntity !== null) {
            return true;
        }

        if (sessionAdminEntity !== null) {
            const req = await (new ValidationPipe().transform(body, {
                type: 'body',
            })) as unknown as ReqFetchEarningsPerDay;
            const farmId = parseInt(req.earningsPerDayFilterEntity.farmId);

            const miningFarmDb = await this.farmService.findMiningFarmById(farmId);
            return miningFarmDb?.accountId === sessionAdminEntity.accountId;
        }

        return false;
    }
}
