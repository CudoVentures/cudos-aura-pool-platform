import { Body, Controller, Post, ValidationPipe, Req, UseInterceptors, UseGuards, Patch, Get, Param, Res, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import RoleGuard from '../auth/guards/role.guard';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import EmailService from '../email/email.service';
import AccountService from './account.service';
import { AccountType } from './account.types';
import { ReqEditSessionAccount, ReqEditSessionAccountPass, ReqEditSessionSuperAdmin, ReqEditSessionUser, ReqForgottenPassword } from './dto/requests.dto';
import { ResEditSessionAccount, ResEditSessionSuperAdmin, ResEditSessionUser, ResFetchFarmOwnerAccount } from './dto/responses.dto';
import AccountEntity from './entities/account.entity';
import SuperAdminEntity from './entities/super-admin.entity';
import UserEntity from './entities/user.entity';
import { EditSessionAccountPassGuard } from './guards/edit-session-account-pass-guard';
import { ЕditSessionAccountGuard } from './guards/edit-session-account.guard';
import { ЕditSessionSuperAdminGuard } from './guards/edit-session-super-admin.guard';
import { EditSessionUserGuard } from './guards/edit-session-user.guard';
import { FetchFarmOwnerAccountGuard } from './guards/fetch-farm-owner.guard';

@Controller('accounts')
export class AccountController {
    constructor(
        private accountService: AccountService,
        private emailService: EmailService,
    ) {}

    @UseGuards(RoleGuard([AccountType.ADMIN]), ЕditSessionAccountGuard)
    @UseInterceptors(TransactionInterceptor)
    @Post('editSessionAccount')
    @HttpCode(200)
    @Throttle(10, 60)
    async editSessionAccount(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqEditSessionAccount: ReqEditSessionAccount,
    ): Promise < ResEditSessionAccount > {
        let accountEntity = AccountEntity.fromJson(reqEditSessionAccount.accountEntity);

        const isEmailChanged = req.sessionAccountEntity.email !== accountEntity.email
        if (isEmailChanged) {
            accountEntity.markAsEmailNotVerified();
        }

        accountEntity = await this.accountService.creditAccount(accountEntity, false, req.transaction);

        if (isEmailChanged) {
            this.emailService.sendVerificationEmail(accountEntity);
        }

        return new ResEditSessionAccount(accountEntity);
    }

    @UseGuards(RoleGuard([AccountType.USER]), EditSessionUserGuard)
    @UseInterceptors(TransactionInterceptor)
    @Post('editSessionUser')
    @HttpCode(200)
    @Throttle(10, 60)
    async editSessionUser(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqEditSessionUser: ReqEditSessionUser,
    ): Promise < ResEditSessionUser > {
        let userEntity = UserEntity.fromJson(reqEditSessionUser.userEntity);

        userEntity = await this.accountService.creditUser(userEntity, req.transaction);

        return new ResEditSessionUser(userEntity);
    }

    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]), ЕditSessionSuperAdminGuard)
    @UseInterceptors(TransactionInterceptor)
    @Post('editSessionSuperAdmin')
    @HttpCode(200)
    @Throttle(10, 60)
    async editSessionSuperAdmin(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqEditSessionSuperAdmin: ReqEditSessionSuperAdmin,
    ): Promise < ResEditSessionSuperAdmin > {
        let superAdminEntity = SuperAdminEntity.fromJson(reqEditSessionSuperAdmin.superAdminEntity);

        superAdminEntity = await this.accountService.creditSuperAdmin(superAdminEntity, req.transaction);

        return new ResEditSessionSuperAdmin(superAdminEntity);
    }

    @UseInterceptors(TransactionInterceptor)
    @UseGuards(EditSessionAccountPassGuard)
    @Patch('editSessionAccountPass')
    @HttpCode(200)
    @Throttle(10, 60)
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

    @UseInterceptors(TransactionInterceptor)
    @UseGuards(RoleGuard([AccountType.ADMIN, AccountType.SUPER_ADMIN]))
    @Patch('sendSessionAccountVerificationEmail')
    @HttpCode(200)
    @Throttle(10, 60)
    async sendSessionAccountVerificationEmail(
        @Req() req: AppRequest,
    ): Promise < void > {
        await this.emailService.sendVerificationEmail(req.sessionAccountEntity);
    }

    @UseInterceptors(TransactionInterceptor)
    @Get('verifyEmail/:token')
    @HttpCode(200)
    @Throttle(10, 60)
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
    @UseInterceptors(TransactionInterceptor)
    @Get('unlockAccount/:token')
    @HttpCode(200)
    @Throttle(10, 60)
    async unlockAccount(
        @Req() req: AppRequest,
        @Res() res,
        @Param('token') encodedToken: string,
    ): Promise < void > {
        try {
            await this.accountService.unlockAccount(encodedToken, req.transaction);
        } catch (ex) {
        }
        return res.redirect('/login');
    }

    @Patch('forgottenPassword')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(10, 60)
    async forgottenPassword(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqForgottenPassword: ReqForgottenPassword,
    ): Promise < void > {
        const accountEntity = await this.accountService.findAccountByEmail(reqForgottenPassword.email, req.transaction);
        if (accountEntity === null) {
            return;
        }
        await this.emailService.sendForgottenPasswordEmail(accountEntity);
    }

    @Get(':accountId')
    @UseGuards(FetchFarmOwnerAccountGuard)
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(10, 60)
    async fetchFarmOwnerAccount(
        @Req() req: AppRequest,
        @Param('accountId') accountId: number,
    ): Promise < ResFetchFarmOwnerAccount > {
        const adminEntity = await this.accountService.findAdminByAccountId(accountId, req.transaction);
        return new ResFetchFarmOwnerAccount(adminEntity);
    }
}
