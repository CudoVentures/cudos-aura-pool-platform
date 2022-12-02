import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import nodemailer from 'nodemailer';
import AccountEntity from '../account/entities/account.entity';
import JwtToken from '../auth/entities/jwt-token.entity';

@Injectable()
export default class EmailService {

    appPublicUrl: string;
    transport: any;

    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
    ) {
        this.appPublicUrl = this.configService.get < string >('APP_PUBLIC_URL') ?? '';

        this.transport = nodemailer.createTransport({
            host: 'mailhog',
            port: 1025,
        })
    }

    async sendVerificationEmail(accountEntity: AccountEntity): Promise < void > {
        try {
            const jwtToken = JwtToken.newInstance(accountEntity);
            const verificationToken = this.jwtService.sign(JwtToken.toJson(jwtToken), JwtToken.getConfig('1d'));

            const verificationEmail = {
                from: 'noreply@aurapool.com',
                to: accountEntity.email,
                subject: 'Email Verification',
                text: `Hello ${accountEntity.name}! Welcome to Aura Pool. Please verify your email by following this link ${this.appPublicUrl}/api/v1/accounts/verifyEmail/${verificationToken}`,
                html: `<b>Hello ${accountEntity.name}! Welcome to Aura Pool. Please verify your email by following this link <a href="${this.appPublicUrl}/api/v1/accounts/verifyEmail/${verificationToken}">Verify</a></b>`,
            };

            console.log(verificationEmail);
            await this.transport.sendMail(verificationEmail);
        } catch (ex) {
            console.error(ex);
        }
    }

    async sendForgottenPasswordEmail(accountEntity: AccountEntity): Promise < void > {
        try {
            const jwtToken = JwtToken.newInstance(accountEntity);
            const verificationToken = this.jwtService.sign(JwtToken.toJson(jwtToken), JwtToken.getConfig('1d'));

            const verificationEmail = {
                from: 'noreply@aurapool.com',
                to: accountEntity.email,
                subject: 'Forgotten password',
                text: `You have requested a password change. Please follow this link ${this.appPublicUrl}/forgotten-pass-edit/${verificationToken}`,
                html: `<b>You have requested a password change. Please follow this link <a href="${this.appPublicUrl}/forgotten-pass-edit/${verificationToken}">Change password</a></b>`,
            };

            await this.transport.sendMail(verificationEmail);
        } catch (ex) {
            console.error(ex);
        }
    }

}
