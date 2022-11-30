import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { RequestWithSessionAccounts } from '../../common/commont.types';
import { Role } from '../../user/roles';

const RoleGuard = (roles: Role[]): Type<CanActivate> => {

    class RoleGuardMixin implements CanActivate {
        async canActivate(context: ExecutionContext) {

            const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();

            const sessionAdminEntity = request.sessionAdminEntity;
            const sessionSuperAdminEntity = request.sessionSuperAdminEntity;

            if (roles.includes(Role.FARM_ADMIN) && sessionAdminEntity !== null) {
                return true;
            }

            if (roles.includes(Role.SUPER_ADMIN) && sessionSuperAdminEntity !== null) {
                return true;
            }

            return false;
        }
    }

    return mixin(RoleGuardMixin);
};

export default RoleGuard;
