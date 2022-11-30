import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Farm } from '../models/farm.model';
import { FarmService } from '../farm.service';
import { FarmDto } from '../dto/farm.dto';
import { RequestWithSessionAccounts } from '../../common/commont.types';

@Injectable()
export class IsCreatorOrSuperAdminGuard extends JwtAuthGuard implements CanActivate {

    constructor(private farmService: FarmService) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();
        const {
            sessionAdminEntity,
            sessionSuperAdminEntity,
            body,
        } = request;

        const farmDto = FarmDto.fromJson(body);

        // super admin can do anything
        if (sessionSuperAdminEntity !== null) {
            return true;
        }

        // not super admin, so is it farm admin
        if (sessionAdminEntity === null) {
            console.log('not admin')
            return false;
        }

        // it is farm admin, so he can always create a new collection?
        if (farmDto.isNew()) {
            console.log('new')

            return true
        }

        return this.farmService
            .findOne(farmDto.id)
            .then((farm: Farm) => farm.creator_id === sessionAdminEntity.accountId);
    }
}
