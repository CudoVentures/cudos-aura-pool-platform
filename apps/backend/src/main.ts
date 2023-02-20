import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { json } from 'express';
import cookieParser from 'cookie-parser';

declare const module: any;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const appPort = configService.get < number >('APP_PORT');
    const appCookiesSecret = configService.get < string >('APP_COOKIES_SECRET') ?? undefined;

    app.setGlobalPrefix('api')
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    })
    app.use(json({ limit: '128mb' }))
    app.use(cookieParser(appCookiesSecret));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('Cudos Aura Pool')
        .setDescription('Cudos Aura Pool')
        .setVersion('1.0')
        .addBearerAuth(
            { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            'access-token',
        )
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(appPort);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}

bootstrap();
