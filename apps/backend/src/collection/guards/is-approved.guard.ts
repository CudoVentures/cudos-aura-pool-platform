import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Farm, FarmStatus } from '../../farm/farm.model';
import { FarmService } from '../../farm/farm.service';
import { CollectionService } from '../collection.service';

@Injectable()
export class IsApprovedGuard extends JwtAuthGuard implements CanActivate {
  constructor(
    private collectionService: CollectionService,
    private farmService: FarmService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { farm_id } = request.body;
    const { id: collectionId } = request.params;

    const farmId =
      request.method === 'POST'
        ? farm_id
        : (await this.collectionService.findOne(collectionId)).farm_id;

    if (!farmId) return false;

    return this.farmService.findOne(farmId).then((farm: Farm) => {
      if (farm.status !== FarmStatus.APPROVED) {
        throw new UnauthorizedException(
          `Farm with id ${farmId} is not verified`,
        );
      }
      return true;
    });
  }
}
