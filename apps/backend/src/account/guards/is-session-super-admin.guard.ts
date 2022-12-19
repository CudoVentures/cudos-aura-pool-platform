import { CanActivate, ExecutionContext, Injectable, ValidationPipe } from '@nestjs/common';
import { RequestWithSessionAccounts } from '../../common/commont.types';
import { ReqEditSessionSuperAdmin } from '../dto/requests.dto';
import SuperAdminEntity from '../entities/super-admin.entity';

@Injectable()
export class IsSessionSuperAdminGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise < boolean > {
        const request = context.switchToHttp().getRequest < RequestWithSessionAccounts >();
        const { body } = request;

        const req = await (new ValidationPipe().transform(body, {
            type: 'body',
        })) as unknown as ReqEditSessionSuperAdmin;
        const superAdminEntity = SuperAdminEntity.fromJson(req.superAdminEntity);

        if (request.sessionSuperAdminEntity === null) {
            return false;
        }

        return superAdminEntity.accountId === request.sessionSuperAdminEntity.accountId;
    }

}
