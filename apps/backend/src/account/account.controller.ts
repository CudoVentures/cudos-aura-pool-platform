import { Body, Controller, Post, ValidationPipe, Req, UseInterceptors, UseGuards, Patch, Get, Query, Param, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { ExtractJwt } from 'passport-jwt';
import RoleGuard from '../auth/guards/role.guard';
import JwtToken from '../auth/jwtToken.entity';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import EmailService from '../email/email.service';
import { Role } from '../user/roles';
import AccountService from './account.service';
import { AccountType } from './account.types';
import { ReqCreditSessionAccount, ReqEditSessionAccountPass } from './dto/requests.dto';
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

    @UseGuards(RoleGuard([Role.FARM_ADMIN]))
    @UseInterceptors(TransactionInterceptor)
    @Post('creditSessionAccount')
    async creditSessionAccount(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqCreditSessionAccount: ReqCreditSessionAccount,
    ): Promise < ResCreditSessionAccount > {
        let accountEntity = AccountEntity.fromJson(reqCreditSessionAccount.accountEntity);
        accountEntity.accountId = req.sessionAccountEntity.accountId;

        accountEntity = await this.accountService.creditAccount(accountEntity, req.transaction);
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
            if (AccountService.isPassValid(accountEntity, reqEditSessionAccountPass.oldPass) === false) {
                throw new Error('Wrong old pass');

            }

            accountEntity.salt = AccountService.generateSalt();
            accountEntity.hashedPass = AccountService.generateHashedPass(reqEditSessionAccountPass.newPass, accountEntity.salt);
            await this.accountService.creditAccount(accountEntity, req.transaction);
            return;
        }

        if (reqEditSessionAccountPass.isTokenMode() === true) {
            // TO DO: Implement forgotten pass
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
            this.jwtService.verify(encodedToken);
            const jwtToken = JwtToken.fromJson(this.jwtService.decode(encodedToken));
            const accountEntity = await this.accountService.findAccountById(jwtToken.id);
            accountEntity.markAsEmailVerified();
            await this.accountService.creditAccount(accountEntity, req.transaction);
        } catch (ex) {
        }

        return res.redirect('/');
    }
}
