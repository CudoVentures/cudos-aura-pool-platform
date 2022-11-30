import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithSessionAccounts } from '../../auth/auth.types';
import { Collection } from '../collection.model';
import { CollectionService } from '../collection.service';
import { CollectionDto } from '../dto/collection.dto';

@Injectable()
export class IsCreatorOrSuperAdminGuard implements CanActivate {

    constructor(private collectionService: CollectionService) {
    }

    async canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();
        const {
            sessionAdminEntity,
            sessionSuperAdminEntity,
            body,
        } = request;

        const collectionDto: CollectionDto = CollectionDto.fromJson(body);

        // super admin can do anything
        if (sessionSuperAdminEntity !== null) {
            return true;
        }

        // not super admin, so is it farm admin
        if (sessionAdminEntity === null) {
            return false;
        }

        // it is farm admin, so he can always create a new collection
        if (collectionDto.isNew()) {
            return true
        }

        // it's not a new collection, so is the farm admin the owner?
        const collection = await this.collectionService.findOne(collectionDto.id);

        return collection.creator_id === sessionAdminEntity.accountId;
    }

}
