import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { FarmService } from '../farm.service';
import { RequestWithSessionAccounts } from '../../common/commont.types';
import { ReqCreditMiningFarm } from '../dto/requests.dto';
import MiningFarmEntity from '../entities/mining-farm.entity';

@Injectable()
export class IsCreatorOrSuperAdminGuard implements CanActivate {

    constructor(private farmService: FarmService) {}

    async canActivate(context: ExecutionContext): Promise < boolean > {
        const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();
        const {
            sessionAdminEntity,
            sessionSuperAdminEntity,
            body,
        } = request;

        const req = await (new ValidationPipe().transform(body, {
            type: 'body',
        })) as unknown as ReqCreditMiningFarm;
        const miningFarmEntity = MiningFarmEntity.fromJson(req.miningFarmEntity);

        // super admin can do anything
        if (sessionSuperAdminEntity !== null) {
            return miningFarmEntity.isNew() === false;
        }

        // not super admin, so is it farm admin
        if (sessionAdminEntity === null) {
            return false;
        }

        if (miningFarmEntity.isNew() === true) {
            return true
        }

        const miningFarmDb = await this.farmService.findMiningFarmById(miningFarmEntity.id);

        if (miningFarmDb === null) {
            throw new UnauthorizedException(
                `Farm with id ${miningFarmDb.id} is not found`,
            );
        }

        return miningFarmDb.accountId === sessionAdminEntity.accountId;
    }
}
