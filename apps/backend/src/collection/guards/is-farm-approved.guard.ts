import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { FarmService } from '../../farm/farm.service';
import { NOT_EXISTS_INT } from '../../common/utils';
import { FarmStatus } from '../../farm/farm.types';
import { CollectionEntity } from '../entities/collection.entity';

@Injectable()
export class IsFarmApprovedGuard implements CanActivate {
    constructor(
      private farmService: FarmService,
    // eslint-disable-next-line no-empty-function
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const collectionEntity: CollectionEntity = CollectionEntity.fromJson(request.body.collectionDto);

        if (collectionEntity.farmId === NOT_EXISTS_INT) return false;

        const farmId = collectionEntity.farmId

        const farm = await this.farmService.findMiningFarmById(farmId);

        if (!farm || farm.status !== FarmStatus.APPROVED) {
            throw new UnauthorizedException(
                `Farm with id ${farmId} is not verified`,
            );
        }

        return true;
    }
}
