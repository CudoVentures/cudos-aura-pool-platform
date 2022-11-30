import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FarmService } from '../farm.service';
import { FarmDto } from '../dto/farm.dto';
import { RequestWithSessionAccounts } from '../../common/commont.types';

@Injectable()
export class IsCreatorOrSuperAdminGuard implements CanActivate {

    constructor(private farmService: FarmService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();
        const {
            sessionAdminEntity,
            sessionSuperAdminEntity,
            body,
        } = request;

        const farmDto = FarmDto.fromJson(body);

        // super admin can do anything
        if (sessionSuperAdminEntity !== null) {
            return true;
        }

        // not super admin, so is it farm admin
        if (sessionAdminEntity === null) {
            return false;
        }

        // it is farm admin, so he can always create a new collection?
        if (farmDto.isNew()) {
            return true
        }

        const farm = await this.farmService.findOne(farmDto.id);

        if (!farm) {
            throw new UnauthorizedException(
                `Farm with id ${farmDto.id} is not found`,
            );
        }

        return farm.creator_id === sessionAdminEntity.accountId;
    }
}
