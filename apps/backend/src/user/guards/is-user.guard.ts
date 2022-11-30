import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithSessionAccounts } from '../../auth/auth.types';

@Injectable()
export class IsUserGuard extends JwtAuthGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();
        const {
            sessionUserEntity,
            params,
        } = request;

        if (sessionUserEntity === null || !params || !params.id) {
            return false;
        }

        const userId = sessionUserEntity.accountId;
        const userToUpdateId = Number(params.id);

        return userId === userToUpdateId;
    }

}
