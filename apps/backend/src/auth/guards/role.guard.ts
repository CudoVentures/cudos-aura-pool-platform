import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { AccountType } from '../../account/account.types';
import { RequestWithSessionAccounts } from '../../common/commont.types';

const RoleGuard = (accountTypes: AccountType[]): Type<CanActivate> => {

    class RoleGuardMixin implements CanActivate {
        async canActivate(context: ExecutionContext) {

            const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();

            const sessionUserEntity = request.sessionUserEntity;
            const sessionAdminEntity = request.sessionAdminEntity;
            const sessionSuperAdminEntity = request.sessionSuperAdminEntity;

            if (accountTypes.includes(AccountType.USER) && sessionUserEntity !== null) {
                return true;
            }

            if (accountTypes.includes(AccountType.ADMIN) && sessionAdminEntity !== null) {
                return true;
            }

            if (accountTypes.includes(AccountType.SUPER_ADMIN) && sessionSuperAdminEntity !== null) {
                return true;
            }

            return false;
        }
    }

    return mixin(RoleGuardMixin);
};

export default RoleGuard;
