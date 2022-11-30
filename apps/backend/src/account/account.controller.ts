import { Body, Controller, Post, ValidationPipe, Req, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import RoleGuard from '../auth/guards/role.guard';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { Role } from '../user/roles';
import AccountService from './account.service';
import { ReqCreditSessionAccount } from './dto/requests.dto';
import { ResCreditSessionAccount } from './dto/responses.dto';
import AccountEntity from './entities/account.entity';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
    constructor(
        private accountService: AccountService,
    ) {}

    @UseGuards(RoleGuard([Role.FARM_ADMIN]))
    @UseInterceptors(TransactionInterceptor)
    @Post('creditSessionAccount')
    async login(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqCreditSessionAccount: ReqCreditSessionAccount,
    ): Promise < ResCreditSessionAccount > {
        let accountEntity = AccountEntity.fromJson(reqCreditSessionAccount.accountEntity);
        accountEntity.accountId = req.sessionAccountEntity.accountId;

        accountEntity = await this.accountService.creditAccount(accountEntity, req.transaction);
        return new ResCreditSessionAccount(accountEntity);
    }
}
