import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CollectionService } from '../../collection/collection.service';
import { CollectionStatus } from '../../collection/utils';
import { Farm, FarmStatus } from '../../farm/farm.model';
import { FarmService } from '../../farm/farm.service';
import { NFTService } from '../nft.service';

@Injectable()
export class IsApprovedGuard extends JwtAuthGuard implements CanActivate {
  constructor(
    private nftService: NFTService,
    private collectionService: CollectionService,
    private farmService: FarmService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { collection_id } = request.body;
    const { id: nftId } = request.params;

    const collectionId =
      request.method === 'POST'
        ? collection_id
        : (await this.nftService.findOne(nftId)).collection_id;

    if (!collectionId) return false;

    const collection = await this.collectionService.findOne(collectionId);

    if (!collection) return false;

    if (collection.status !== CollectionStatus.APPROVED) {
      throw new UnauthorizedException(
        `Collection with id ${collectionId} is not verified`,
      );
    }

    return this.farmService.findOne(collection.farm_id).then((farm: Farm) => {
      if (farm.status !== FarmStatus.APPROVED) {
        throw new UnauthorizedException(
          `Farm with id ${collection.farm_id} is not verified`,
        );
      }
      return true;
    });
  }
}
