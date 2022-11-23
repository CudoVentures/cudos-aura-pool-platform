import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [SequelizeModule.forFeature([User])],
    providers: [UserService, JwtService],
    controllers: [UserController],
    exports: [SequelizeModule, UserService],
})
export class UserModule {}
