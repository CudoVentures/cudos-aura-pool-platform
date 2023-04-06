import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import JwtCudoService from './jwt.service';

@Module({
    imports: [JwtModule],
    providers: [JwtCudoService],
    exports: [JwtCudoService],
})
export class JwtCudoModule {}
