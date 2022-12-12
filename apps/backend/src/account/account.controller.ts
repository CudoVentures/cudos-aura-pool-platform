import { Body, Controller, Post, ValidationPipe, Req, UseInterceptors, UseGuards, Patch, Get, Param, Res, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResFetchSessionAccounts } from '../auth/dto/responses.dto';
import RoleGuard from '../auth/guards/role.guard';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { IntBoolValue } from '../common/utils';
import EmailService from '../email/email.service';
import AccountService from './account.service';
import { AccountType } from './account.types';
import { ReqEditSessionAccount, ReqEditSessionAccountPass, ReqForgottenPassword } from './dto/requests.dto';
import { ResEditSessionAccount } from './dto/responses.dto';
import AccountEntity from './entities/account.entity';
import { IsSessionAccountGuard } from './guards/is-session-account.guard';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
    constructor(
        private accountService: AccountService,
        private emailService: EmailService,
    // eslint-disable-next-line no-empty-function
    ) {}

    @UseGuards(RoleGuard([AccountType.ADMIN]), IsSessionAccountGuard)
    @UseInterceptors(TransactionInterceptor)
    @Post('editSessionAccount')
    @HttpCode(200)
    async editSessionAccount(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqEditSessionAccount: ReqEditSessionAccount,
    ): Promise < ResEditSessionAccount > {
        let accountEntity = AccountEntity.fromJson(reqEditSessionAccount.accountEntity);

        const isEmailChanged = req.sessionAccountEntity && req.sessionAccountEntity.email !== accountEntity.email
        if (isEmailChanged) {
            accountEntity.markAsEmailNotVerified();
        }

        accountEntity = await this.accountService.creditAccount(accountEntity, false, req.transaction);

        if (isEmailChanged) {
            this.emailService.sendVerificationEmail(accountEntity);
        }

        return new ResEditSessionAccount(accountEntity);
    }

    @UseInterceptors(TransactionInterceptor)
    @Patch('editSessionAccountPass')
    @HttpCode(200)
    async editSessionAccountPass(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqEditSessionAccountPass: ReqEditSessionAccountPass,
    ): Promise < void > {
        if (reqEditSessionAccountPass.isOldPassMode() === true) {
            const accountEntity = req.sessionAccountEntity;
            await this.accountService.editAccountPassByOldPass(accountEntity, reqEditSessionAccountPass.oldPass, reqEditSessionAccountPass.newPass, req.transaction);
        } else if (reqEditSessionAccountPass.isTokenMode() === true) {
            await this.accountService.editAccountPassByToken(reqEditSessionAccountPass.token, reqEditSessionAccountPass.newPass, req.transaction);
        }
    }

    @UseGuards(RoleGuard([AccountType.ADMIN, AccountType.SUPER_ADMIN]))
    @Patch('sendSessionAccountVerificationEmail')
    @HttpCode(200)
    async sendSessionAccountVerificationEmail(
        @Req() req: AppRequest,
    ): Promise < void > {
        await this.emailService.sendVerificationEmail(req.sessionAccountEntity);
    }

    @UseInterceptors(TransactionInterceptor)
    @Get('verifyEmail/:token')
    @HttpCode(200)
    async verifyEmail(
        @Req() req: AppRequest,
        @Res() res,
        @Param('token') encodedToken: string,
    ): Promise < void > {
        try {
            await this.accountService.verifyEmailByToken(encodedToken, req.transaction);
        } catch (ex) {
        }
        return res.redirect('/');
    }

    @Patch('forgottenPassword')
    @HttpCode(200)
    async forgottenPassword(
        @Body(new ValidationPipe({ transform: true })) reqForgottenPassword: ReqForgottenPassword,
    ): Promise < void > {
        const accountEntity = await this.accountService.findAccountByEmail(reqForgottenPassword.email);
        if (accountEntity === null) {
            return;
        }
        await this.emailService.sendForgottenPasswordEmail(accountEntity);
    }

    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
    @Get(':accountId')
    @HttpCode(200)
    async fetchFarmOwnerAccounts(
        @Param('accountId') accountId: number,
    ): Promise < ResFetchSessionAccounts > {
        const res = await this.accountService.findAccounts(accountId);
        return new ResFetchSessionAccounts(res.accountEntity, res.userEntity, res.adminEntity, res.superAdminEntity, IntBoolValue.FALSE);
    }
}
