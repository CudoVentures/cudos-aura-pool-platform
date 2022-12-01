import { Body, Controller, Post, ValidationPipe, Req, UseInterceptors, UseGuards, Patch, Get, Query, Param, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import RoleGuard from '../auth/guards/role.guard';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import EmailService from '../email/email.service';
import AccountService from './account.service';
import { AccountType } from './account.types';
import { ReqCreditSessionAccount, ReqEditSessionAccountPass, ReqForgottenPassword } from './dto/requests.dto';
import { ResCreditSessionAccount } from './dto/responses.dto';
import AccountEntity from './entities/account.entity';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
    constructor(
        private accountService: AccountService,
        private emailService: EmailService,
        private jwtService: JwtService,
    ) {}

    @UseGuards(RoleGuard([AccountType.ADMIN]))
    @UseInterceptors(TransactionInterceptor)
    @Post('creditSessionAccount')
    async creditSessionAccount(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqCreditSessionAccount: ReqCreditSessionAccount,
    ): Promise < ResCreditSessionAccount > {
        let accountEntity = AccountEntity.fromJson(reqCreditSessionAccount.accountEntity);
        accountEntity.accountId = req.sessionAccountEntity.accountId;
        accountEntity = await this.accountService.creditAccount(accountEntity, false, req.transaction);
        return new ResCreditSessionAccount(accountEntity);
    }

    @UseInterceptors(TransactionInterceptor)
    @Patch('editSessionAccountPass')
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
    async sendSessionAccountVerificationEmail(
        @Req() req: AppRequest,
    ): Promise < void > {
        await this.emailService.sendVerificationEmail(req.sessionAccountEntity);
    }

    @Get('verifyEmail/:token')
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
    async forgottenPassword(
        @Body(new ValidationPipe({ transform: true })) reqForgottenPassword: ReqForgottenPassword,
    ): Promise < void > {
        const accountEntity = await this.accountService.findAccountByEmail(reqForgottenPassword.email);
        if (accountEntity === null) {
            return;
        }
        await this.emailService.sendForgottenPasswordEmail(accountEntity);
    }
}
