import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.model';
import { UpdateUserDto } from './dto/update-user.dto';
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

    generateRandomPassword(length: number) {
        let password = '';
        const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        const array = new Uint32Array(length);
        crypto.webcrypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            password += chars[array[i] % chars.length];
        }

        return password;
    }

    generateSalt() {
        return crypto.randomBytes(128).toString('base64');
    }

    generateHashedPass(password: string, salt: string) {
        return crypto.createHmac('sha512', salt).update(password).digest('hex');
    }

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

    async createFarmAdmin(createUserDto: CreateUserDto): Promise<User> {
        const { password } = createUserDto
        const salt = this.generateSalt();
        const hashed_pass = this.generateHashedPass(password, salt);

        const user = {
            ...createUserDto,
            hashed_pass,
            salt,
            role: 'farm_admin',
            is_active: true,
            email_verified: false,
        };

        const farmAdmin = await User.create(user);

        this.sendVerificationEmail(farmAdmin);

        return farmAdmin;
    }

    async findById(userId: number): Promise < User > {
        return this.userModel.findByPk(userId);
    }

    async findOne(email: string): Promise<User> {
        const user = await this.userModel.findOne({
            where: {
                email,
            },
        });

        return user;
    }

    async updateOne(
        id: number,
        updateUserDto: Partial<UpdateUserDto>,
    ): Promise<User> {
        const [count, [user]] = await this.userModel.update(
            { ...updateUserDto },
            { where: { id }, returning: true },
        );

        return user;
    }

    async changePassword(id: number, oldPassword: string, password: string) {
        const userToCheck = await this.userModel.findByPk(id);

        if (!userToCheck) {
            throw new NotFoundException('Incorrect id');
        }

        const hashedPass = this.generateHashedPass(oldPassword, userToCheck.salt);

        if (userToCheck.hashed_pass !== hashedPass) {
            throw new UnauthorizedException('Incorrect password');
        }

        const salt = this.generateSalt();
        const hashed_pass = this.generateHashedPass(password, salt);

        const [count, [user]] = await this.userModel.update(
            { salt, hashed_pass },
            { where: { id }, returning: true },
        );

        return user;
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
