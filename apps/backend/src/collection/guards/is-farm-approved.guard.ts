import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Farm, FarmStatus } from '../../farm/models/farm.model';
import { FarmService } from '../../farm/farm.service';
import { CollectionDto } from '../dto/collection.dto';
import { NOT_EXISTS_INT } from '../../common/utils';

@Injectable()
export class IsFarmApprovedGuard extends JwtAuthGuard implements CanActivate {
    constructor(
      private farmService: FarmService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const collectionDto: CollectionDto = CollectionDto.fromJson(request.body);

        if (collectionDto.farm_id === NOT_EXISTS_INT) return false;

        const farmId = collectionDto.farm_id
        return this.farmService.findOne(farmId).then((farm: Farm) => {
            if (farm === null || farm.status !== FarmStatus.APPROVED) {
                throw new UnauthorizedException(
                    `Farm with id ${farmId} is not verified`,
                );
            }
            return true;
        });
    }
}
