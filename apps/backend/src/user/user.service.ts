import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.model';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
    @InjectModel(User)
    private userModel: typeof User,
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

    async sendPasswordEmail(password: string) {
        const transporter = nodemailer.createTransport({
            service: 'mail.service',
            auth: {
                user: 'some-noreply-mail@mail.com',
                pass: 'password123',
            },
        });

        await transporter.sendMail({
            from: '"Aura Pool" <some-noreply-mail@mail.com>',
            to: 'farm_admin@mail.com',
            subject: '',
            text: `Your temporary password is ${password}. Please change that as soon as possible`,
            html: `<b>Your temporary password is ${password}. Please change that as soon as possible</b>`,
        });
    }

    async createFarmAdmin(createUserDto: CreateUserDto): Promise<User> {
        const { password, cudos_address } = createUserDto
        const salt = this.generateSalt();
        const hashed_pass = this.generateHashedPass(password, salt);

        const user = {
            email: createUserDto.email,
            salt,
            hashed_pass,
            role: 'farm_admin',
            cudos_address,
            is_active: true,
        };

        const farmAdmin = await User.create(user);

        // await this.sendPasswordEmail(password);

        return farmAdmin;
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
}
