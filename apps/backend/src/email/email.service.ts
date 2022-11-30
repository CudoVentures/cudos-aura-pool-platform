import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import nodemailer from 'nodemailer';
import AccountEntity from '../account/entities/account.entity';
import { jwtConstants } from '../auth/constants';
import JwtToken from '../auth/jwtToken.entity';

@Injectable()
export default class EmailService {

    transport: any;

    constructor(private jwtService: JwtService) {
        this.transport = nodemailer.createTransport({
            host: 'mailhog',
            port: 1025,
        })
    }

    async sendVerificationEmail(accountEntity: AccountEntity): Promise < void > {
        try {
            const jwtToken = JwtToken.newInstance(accountEntity);
            const verificationToken = this.jwtService.sign(JwtToken.toJson(jwtToken), { expiresIn: '1d' });

            const verificationEmail = {
                from: `"Aura Pool" <${process.env.App_Mailing_Service_Email}>`,
                to: accountEntity.email,
                subject: 'Email Verification',
                text: `Hello ${accountEntity.name}! Welcome to Aura Pool. Please verify your email by following this link http://localhost:3001/api/v1/accounts/verifyEmail/${verificationToken}`,
                html: `<b>Hello ${accountEntity.name}! Welcome to Aura Pool. Please verify your email by following this link <a href="http://localhost:3001/api/v1/accounts/verifyEmail/${verificationToken}">Verify</a></b>`,
            };

            await this.transport.sendMail(verificationEmail);
        } catch (ex) {
            console.error(ex);
        }
    }

}
