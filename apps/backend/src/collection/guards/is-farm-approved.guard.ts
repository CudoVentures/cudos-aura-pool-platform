import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Farm, FarmStatus } from '../../farm/models/farm.model';
import { FarmService } from '../../farm/farm.service';

@Injectable()
export class IsFarmApprovedGuard extends JwtAuthGuard implements CanActivate {
    constructor(
      private farmService: FarmService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const { farm_id } = request.body;

        const farmId = farm_id;

        if (!farmId) return false;

        const farm = await this.farmService.findOne(farmId);

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
