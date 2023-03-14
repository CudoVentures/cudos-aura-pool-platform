import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { RequestWithSessionAccounts } from '../../common/commont.types';

class ApiKeyGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();
        const apiKey = request.header('aura-pool-api-key');

        return apiKey === process.env.App_Aura_Pool_Api_Key;
    }
}

export default ApiKeyGuard;
