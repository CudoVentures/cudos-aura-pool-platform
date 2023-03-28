import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { FarmService } from '../../farm/farm.service';
import { NOT_EXISTS_INT } from '../../common/utils';
import { CollectionEntity } from '../entities/collection.entity';
import { AppRequest } from '../../common/commont.types';
import { ReqCreditCollection, ReqEditCollection } from '../dto/requests.dto';

@Injectable()
export class IsFarmApprovedGuard {

    constructor(private farmService: FarmService) {}

    async canActivate(request: AppRequest, req: ReqCreditCollection | ReqEditCollection): Promise < void > {
        // const req = context.switchToHttp().getRequest<AppRequest>();
        const collectionEntity: CollectionEntity = CollectionEntity.fromJson(req.collectionDto);

        if (collectionEntity.farmId === NOT_EXISTS_INT) {
            throw new UnauthorizedException();
        }

        const farmId = collectionEntity.farmId;
        const farm = await this.farmService.findMiningFarmById(farmId, request.transaction);

        if (farm?.isApproved() === true) {
            return;
        }

        throw new UnauthorizedException();

    }
}
