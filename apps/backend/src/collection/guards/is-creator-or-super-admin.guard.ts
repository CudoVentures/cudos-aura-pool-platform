import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CollectionService } from '../collection.service';
import { RequestWithSessionAccounts } from '../../common/commont.types';
import { CollectionEntity } from '../entities/collection.entity';

@Injectable()
export class IsCreatorOrSuperAdminGuard implements CanActivate {

    constructor(@Inject(forwardRef(() => CollectionService)) private collectionService: CollectionService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();
        const {
            sessionAdminEntity,
            sessionSuperAdminEntity,
            body,
        } = request;

        const collectionEntity: CollectionEntity = CollectionEntity.fromJson(body.collectionDto);

        // super admin can do anything
        if (sessionSuperAdminEntity !== null) {
            return true;
        }

        // not super admin, so is it farm admin
        if (sessionAdminEntity === null) {
            return false;
        }

        // it is farm admin, so he can always create a new collection
        if (collectionEntity.isNew()) {
            return true
        }

        // it's not a new collection, so is the farm admin the owner?
        const collection = await this.collectionService.findOne(collectionEntity.id);

        if (!collection) {
            throw new UnauthorizedException(
                `Collection with id ${collectionEntity.id} is not found`,
            );
        }

        return collection.creatorId === sessionAdminEntity.accountId;
    }

}
