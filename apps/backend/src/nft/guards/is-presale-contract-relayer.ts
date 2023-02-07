import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestWithSessionAccounts } from '../../common/commont.types';

@Injectable()
export class IsPresaleContractRelayerGuard implements CanActivate {

    // eslint-disable-next-line no-empty-function
    constructor(
        private config: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();
        const {
            body,
        } = request;

        return body.token === this.config.get('App_Eth_Contract_Relayer_token');
    }
}
