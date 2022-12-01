import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import EmailService from './email.service';

@Module({
    providers: [EmailService, JwtService],
    exports: [EmailService],
})
export class EmailModule {}
