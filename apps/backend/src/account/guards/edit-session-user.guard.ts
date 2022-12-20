import { CanActivate, ExecutionContext, Injectable, ValidationPipe } from '@nestjs/common';
import { RequestWithSessionAccounts } from '../../common/commont.types';
import { ReqEditSessionUser } from '../dto/requests.dto';
import UserEntity from '../entities/user.entity';

@Injectable()
export class EditSessionUserGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise < boolean > {
        const request = context.switchToHttp().getRequest < RequestWithSessionAccounts >();
        const { body } = request;

        const req = await (new ValidationPipe().transform(body, {
            type: 'body',
        })) as unknown as ReqEditSessionUser;
        const userEntity = UserEntity.fromJson(req.userEntity);

        if (request.sessionUserEntity === null) {
            return false;
        }

        return userEntity.accountId === request.sessionUserEntity.accountId;
    }

}
