import { UnauthorizedException } from '@nestjs/common';
import { FarmService } from '../farm.service';
import { AppRequest } from '../../common/commont.types';
import { ReqCreditMiningFarm } from '../dto/requests.dto';
import MiningFarmEntity from '../entities/mining-farm.entity';

export class IsCreatorOrSuperAdminGuard {

    constructor(private farmService: FarmService) {}

    async canActivate(request: AppRequest, req: ReqCreditMiningFarm): Promise < void > {
        // const request = context.switchToHttp().getRequest<AppRequest>();
        const {
            sessionAdminEntity,
            sessionSuperAdminEntity,
            // body,
        } = request;

        // const req = await (new ValidationPipe({ transform: true }).transform(body, {
        //     type: 'body',
        //     metatype: ReqCreditMiningFarm,
        // })) as ReqCreditMiningFarm;
        const miningFarmEntity = MiningFarmEntity.fromJson(req.miningFarmEntity);

        // super admin can do anything
        if (sessionSuperAdminEntity !== null) {
            if (miningFarmEntity.isNew() === true) {
                throw new UnauthorizedException();
            }
            return;
        }

        // not super admin, so is it farm admin
        if (sessionAdminEntity === null) {
            throw new UnauthorizedException();
        }

        if (miningFarmEntity.isNew() === true) {
            return;
        }

        const miningFarmDb = await this.farmService.findMiningFarmById(miningFarmEntity.id, request.transaction);
        if (miningFarmDb?.accountId === sessionAdminEntity.accountId) {
            return;
        }

        throw new UnauthorizedException();
    }
}
