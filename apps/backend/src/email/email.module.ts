import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import EmailService from './email.service';

@Module({
    imports: [JwtModule],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
