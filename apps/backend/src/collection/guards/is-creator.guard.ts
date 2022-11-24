import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../auth/interfaces/request.interface';
import { Role } from '../../user/roles';
import { Collection } from '../collection.model';
import { CollectionService } from '../collection.service';

@Injectable()
export class IsCreatorGuard extends JwtAuthGuard implements CanActivate {
    constructor(private collectionService: CollectionService) {
        super();
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const { user, body } = request;

        if (!user || !body) return false;

        if (body.id < 0) {
            return true
        }

        if (user.role === Role.SUPER_ADMIN) {
            return true;
        }

        const userId = user.id;
        const collectionId = parseInt(body.id);

        return this.collectionService
            .findOne(collectionId)
            .then((collection: Collection) => collection.creator_id === userId);
    }
}
