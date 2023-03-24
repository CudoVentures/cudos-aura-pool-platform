import { CanActivate, ExecutionContext, Injectable, ValidationPipe } from '@nestjs/common';
import { RequestWithSessionAccounts } from '../../common/commont.types';
import { ReqEditSessionAccountPass } from '../dto/requests.dto';

@Injectable()
export class EditSessionAccountPassGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise < boolean > {
        const request = context.switchToHttp().getRequest < RequestWithSessionAccounts >();
        const { body } = request;

        const req = await (new ValidationPipe({ transform: true }).transform(body, {
            type: 'body',
            metatype: ReqEditSessionAccountPass,
        })) as ReqEditSessionAccountPass;

        if (req.isOldPassMode() === true) {
            if (request.sessionAccountEntity === null) {
                return false;
            }
        }

        return true;
    }

}
