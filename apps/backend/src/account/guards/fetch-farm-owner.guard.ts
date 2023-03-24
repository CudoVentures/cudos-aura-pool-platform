import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RequestWithSessionAccounts } from '../../common/commont.types';

@Injectable()
export class FetchFarmOwnerAccountGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise < boolean > {
        const request = context.switchToHttp().getRequest < RequestWithSessionAccounts >();
        const accountId = request.params.accountId;
        return /^\d+$/.test(accountId);
    }

}
