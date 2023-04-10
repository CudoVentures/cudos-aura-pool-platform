import { Module } from '@nestjs/common';
import { GeneralModule } from '../general/general.module';
import EmailService from './email.service';
import { JwtCudoModule } from '../jwt/jwt.module';

@Module({
    imports: [JwtCudoModule, GeneralModule],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
