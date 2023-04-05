import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import nodemailer from 'nodemailer';
import AccountEntity from '../account/entities/account.entity';
import JwtToken from '../auth/entities/jwt-token.entity';
import { EmailTemplateEntity } from './entities/email-template.entity';
import sgMail from '@sendgrid/mail';
import GeneralService from '../general/general.service';

@Injectable()
export default class EmailService {

    lockedAccountEmailSentTimestamps: Map < string, number >;
    appPublicUrl: string;
    emailFrom: string;
    transport: any;

    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
        private generalService: GeneralService,
    ) {
        this.lockedAccountEmailSentTimestamps = new Map();

        this.appPublicUrl = this.configService.get < string >('APP_PUBLIC_URL') ?? '';
        this.emailFrom = this.configService.get < string >('APP_EMAIL_FROM') ?? '';

        if (this.generalService.isProduction() === true) {
            sgMail.setApiKey(this.configService.get < string >('APP_SENDGRID_API_KEY') ?? '');
        }

        if (this.generalService.isDev() === true) {
            this.transport = nodemailer.createTransport({
                host: 'mailhog',
                port: 1025,
            });
        }
    }

    async sendLockedAccountEmail(accountEntity: AccountEntity): Promise < void > {
        const emailSentTimestamp = this.lockedAccountEmailSentTimestamps.get(accountEntity.email);

        // send at most every 10 minutes.
        if (emailSentTimestamp !== undefined && emailSentTimestamp > Date.now() - 10 * 60 * 1000) {
            return;
        }

        try {
            const jwtToken = JwtToken.newInstance(accountEntity);
            const verificationToken = this.jwtService.sign(JwtToken.toJson(jwtToken), JwtToken.getConfig('30m'));
            const emailTemplateEntity = new EmailTemplateEntity(
                `Hello ${accountEntity.name}! There have been multiple unsuccessful login attempts in Aura Pool with your email. If this was you, please proceed to unlock your account. If this was not an action performed by you, please contact us.`,
                'Unlock account',
                `${this.appPublicUrl}/api/v1/accounts/unlockAccount/${verificationToken}`,
            );

            const verificationEmail = {
                from: this.emailFrom,
                to: accountEntity.email,
                subject: 'Locked Account',
                html: emailTemplateEntity.build(),
            };

            await this.sendEmail(verificationEmail);

            this.lockedAccountEmailSentTimestamps.set(accountEntity.email, Date.now());
        } catch (ex) {
            console.error(ex);
        }
    }

    async sendVerificationEmail(accountEntity: AccountEntity): Promise < void > {
        try {
            const jwtToken = JwtToken.newInstance(accountEntity);
            const verificationToken = this.jwtService.sign(JwtToken.toJson(jwtToken), JwtToken.getConfig('1d'));
            const emailTemplateEntity = new EmailTemplateEntity(`Hello ${accountEntity.name}! Welcome to Aura Pool. Please verify your email.`, 'Verify', `${this.appPublicUrl}/api/v1/accounts/verifyEmail/${verificationToken}`);

            const verificationEmail = {
                from: this.emailFrom,
                to: accountEntity.email,
                subject: 'Email Verification',
                html: emailTemplateEntity.build(),
            };

            await this.sendEmail(verificationEmail);
        } catch (ex) {
            console.error(ex);
        }
    }

    async sendForgottenPasswordEmail(accountEntity: AccountEntity): Promise < void > {
        try {
            const jwtToken = JwtToken.newInstance(accountEntity);
            const verificationToken = this.jwtService.sign(JwtToken.toJson(jwtToken), JwtToken.getConfig('1d'));
            const emailTemplateEntity = new EmailTemplateEntity('You have requested a password change. Please follow the link below.', 'Reset password', `${this.appPublicUrl}/forgotten-pass-edit/${verificationToken}`);

            const verificationEmail = {
                from: this.emailFrom,
                to: accountEntity.email,
                subject: 'Forgotten password',
                html: emailTemplateEntity.build(),
            };

            await this.sendEmail(verificationEmail);
        } catch (ex) {
            console.error(ex);
        }
    }

    private async sendEmail(emailObj) {
        try {
            if (this.emailFrom === '') {
                throw Error('Service email is not configured');
            }

            if (this.generalService.isProduction() === true) {
                await sgMail.send(emailObj);
            }

            if (this.generalService.isDev() === true) {
                await this.transport.sendMail(emailObj);
            }
        } catch (ex) {
            console.log(ex);
        }
    }

}
