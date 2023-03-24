import { CanActivate, ExecutionContext, Injectable, ValidationPipe } from '@nestjs/common';
import { RequestWithSessionAccounts } from '../../common/commont.types';
import { ReqEditSessionAccount } from '../dto/requests.dto';
import AccountEntity from '../entities/account.entity';

@Injectable()
export class ЕditSessionAccountGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise < boolean > {
        const request = context.switchToHttp().getRequest < RequestWithSessionAccounts >();
        const { body } = request;

        const req = await (new ValidationPipe({ transform: true }).transform(body, {
            type: 'body',
            metatype: ReqEditSessionAccount,
        })) as ReqEditSessionAccount;
        const accountEntity = AccountEntity.fromJson(req.accountEntity);

        if (request.sessionAccountEntity === null) {
            return false;
        }

        return accountEntity.accountId === request.sessionAccountEntity.accountId;
    }

}
