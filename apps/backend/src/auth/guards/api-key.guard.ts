import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { RequestWithSessionAccounts } from '../../common/commont.types';

class ApiKeyGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();
        const apiKey = request.header('cudos-markets-api-key');

        return apiKey === process.env.App_Cudos_Markets_Api_Key;
    }
}

export default ApiKeyGuard;
