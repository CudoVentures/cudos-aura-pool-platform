import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express'
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { json } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { ResponseAddHeadersInterceptor } from './common/common.interceptors';

declare const module: any;

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);
    const appPort = configService.get < number >('APP_PORT');
    const appCookiesSecret = configService.get < string >('APP_COOKIES_SECRET') ?? undefined;

    app.setGlobalPrefix('api')
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    })
    app.use(json({ limit: '256mb' }))
    app.set('trust proxy', 1);
    app.use(cookieParser(appCookiesSecret));
    app.use(compression());
    app.useGlobalInterceptors(new ResponseAddHeadersInterceptor());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        }),
    );

    // const config = new DocumentBuilder()
    //     .setTitle('CUDOS Markets')
    //     .setDescription('CUDOS Markets')
    //     .setVersion('1.0')
    //     .addBearerAuth(
    //         { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    //         'access-token',
    //     )
    //     .build();
    // const document = SwaggerModule.createDocument(app, config);
    // SwaggerModule.setup('api', app, document);

    await app.listen(appPort);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}

bootstrap();
