import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import nodemailer from 'nodemailer';
import { User } from './user.model';
import { JwtService } from '@nestjs/jwt';
import { EmailInterface } from './interfaces/email.interface';
import { jwtConstants } from '../auth/constants';

@Injectable()
export class UserService {
    constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private jwtService: JwtService,
    ) {}

    async sendEmail(email: EmailInterface): Promise <void> {
        const transporter = nodemailer.createTransport({
            service: process.env.App_Mailing_Service,
            auth: {
                user: process.env.App_Mailing_Service_Email,
                pass: process.env.App_Mailing_Service_Pass,
            },
        });

        await transporter.sendMail(email)
    }

    async sendPasswordEmail(password: string): Promise<void> {
        const passwordEmail = {
            from: '"Aura Pool" <some-noreply-mail@mail.com>',
            to: 'farm_admin@mail.com',
            subject: '',
            text: `Your temporary password is ${password}. Please change that as soon as possible`,
            html: `<b>Your temporary password is ${password}. Please change that as soon as possible</b>`,
        };

        await this.sendEmail(passwordEmail)
    }

    async sendVerificationEmail(user: User): Promise<void> {
        const verificationToken = this.jwtService.sign({ userId: user.id }, { expiresIn: '1d', secret: jwtConstants.secret });

        const verificationEmail = {
            from: `"Aura Pool" <${process.env.App_Mailing_Service_Email}>`,
            to: user.email,
            subject: 'Email Verification',
            text: `Hello ${user.name}! Welcome to Aura Pool. Please verify your email by following this link http://localhost:3001/api/v1/user/verify/${verificationToken}`,
            html: `<b>Hello ${user.name}! Welcome to Aura Pool. Please verify your email by following this link http://localhost:3001/api/v1/user/verify/${verificationToken}</b>`,
        };

        this.sendEmail(verificationEmail)
    }

    async verifyEmail(token: string): Promise<{ verified: boolean}> {
        try {
            const decoded = this.jwtService.verify(token, { secret: jwtConstants.secret })

            const { userId } = decoded

            const [count, [user]] = await this.userModel.update(
                { email_verified: true },
                { where: { id: userId }, returning: true },
            );

            return { verified: user.email_verified }
        } catch (err) {
            throw new UnauthorizedException('Token expired')
        }
    }
}
