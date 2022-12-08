import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { FarmService } from '../../farm/farm.service';
import { CollectionDto } from '../dto/collection.dto';
import { NOT_EXISTS_INT } from '../../common/utils';
import { FarmStatus } from '../../farm/farm.types';

@Injectable()
export class IsFarmApprovedGuard implements CanActivate {
    constructor(
      private farmService: FarmService,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const collectionDto: CollectionDto = CollectionDto.fromJson(request.body);

        if (collectionDto.farm_id === NOT_EXISTS_INT) return false;

        const farmId = collectionDto.farm_id

        const farm = await this.farmService.findMiningFarmById(farmId);

        if (!farm || farm.status !== FarmStatus.APPROVED) {
            throw new UnauthorizedException(
                `Farm with id ${farmId} is not verified`,
            );
        }

        return true;
    }
}
