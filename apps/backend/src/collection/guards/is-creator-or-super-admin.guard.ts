import { UnauthorizedException } from '@nestjs/common';
import { CollectionService } from '../collection.service';
import { AppRequest } from '../../common/commont.types';
import { CollectionEntity } from '../entities/collection.entity';
import { FarmService } from '../../farm/farm.service';
import { ReqCreditCollection, ReqEditCollection } from '../dto/requests.dto';

export class IsCreatorOrSuperAdminGuard {

    constructor(private collectionService: CollectionService, private farmService: FarmService) {}

    async canActivate(request: AppRequest, req: ReqCreditCollection | ReqEditCollection): Promise < void > {
        // const request = context.switchToHttp().getRequest<AppRequest>();
        const {
            sessionAdminEntity,
            sessionSuperAdminEntity,
            // body,
        } = request;

        const collectionEntity: CollectionEntity = CollectionEntity.fromJson(req.collectionDto);

        // super admin can do anything
        if (sessionSuperAdminEntity !== null) {
            return;
        }

        // not super admin, so is it farm admin
        if (sessionAdminEntity === null) {
            throw new UnauthorizedException();
        }

        const miningFarmDb = await this.farmService.findMiningFarmById(collectionEntity.farmId, request.transaction);
        if (miningFarmDb === null || miningFarmDb.accountId !== sessionAdminEntity.accountId) {
            throw new UnauthorizedException();
        }

        // it is farm admin, so he can always create a new collection
        if (collectionEntity.isNew()) {
            return
        }

        // it's not a new collection, so is the farm admin the owner?
        const collection = await this.collectionService.findOne(collectionEntity.id, request.transaction);
        if (collection?.creatorId === sessionAdminEntity.accountId) {
            return;
        }

        throw new UnauthorizedException();
    }

}
