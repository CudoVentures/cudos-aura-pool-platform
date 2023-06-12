import Path from 'path';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FarmModule } from './farm/farm.module';
import { CollectionModule } from './collection/collection.module';
import { NFTModule } from './nft/nft.module';
import { StatisticsModule } from './statistics/statistics.module';
import { GraphqlModule } from './graphql/graphql.module';
import { VisitorMiddleware } from './visitor/visitor.middleware';
import { VisitorModule } from './visitor/visitor.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { DataModule } from './data/data.module';
import DataService from './data/data.service';
import { GeneralModule } from './general/general.module';
import { AccountModule } from './account/account.module';
import { EmailModule } from './email/email.module';
import { KycModule } from './kyc/kyc.module';
import { AllowlistModule } from './allowlist/allowlist.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { CONFIG_SERVICE_ROOT_PATH_KEY } from './common/utils';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerBehindProxyGuard } from './app.guards';
import { JwtCudoModule } from './jwt/jwt.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
    imports: [
        GeneralModule,
        AuthModule,
        AccountModule,
        FarmModule,
        CollectionModule,
        NFTModule,
        StatisticsModule,
        GraphqlModule,
        VisitorModule,
        DataModule,
        EmailModule,
        KycModule,
        AllowlistModule,
        JwtCudoModule,
        ThrottlerModule.forRoot(),
        SequelizeModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    dialect: 'postgres',
                    host: config.get('APP_DATABASE_HOST'),
                    port: config.get('APP_DATABASE_PORT'),
                    username: config.get('APP_DATABASE_USER'),
                    password: config.get('APP_DATABASE_PASS'),
                    database: config.get('APP_DATABASE_DB_NAME'),
                    autoLoadModels: true,
                    synchronize: false,
                    logging: false,
                    pool: {
                        max: 24,
                    },
                }
            },
        }),
        ServeStaticModule.forRoot({
            rootPath: Path.join(__dirname, '..', '..', 'data'),
            serveRoot: DataService.LOCAL_URI_PREFIX,
            serveStaticOptions: {
                cacheControl: true,
                maxAge: 2592000000,
            },
        }),
        ServeStaticModule.forRoot({
            rootPath: Path.join(__dirname, '..', 'frontend', 'src', 'public'),
            serveStaticOptions: {
                setHeaders: (res, path, stat) => {
                    if (path.indexOf('index.html') !== -1) {
                        console.log('no cache', path);
                        res.setHeader('Cache-Control', 'no-store, no-cache');
                    } else {
                        console.log('cache', path);
                        res.setHeader('Cache-Control', 'public, max-age=2592000');
                    }
                },
            },
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['./config/.env'],
            load: [() => {
                const Config = {};
                Config[CONFIG_SERVICE_ROOT_PATH_KEY] = Path.join(__dirname, '..', '..');
                Object.keys(process.env).forEach((envName) => {
                    const envNameUppercase = envName.toUpperCase();
                    if (envNameUppercase.startsWith('APP_') === false) {
                        return;
                    }

                    Config[envNameUppercase] = process.env[envName];
                });
                return Config;
            }],
        }),
    ],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerBehindProxyGuard,
        },
    ],
})

export class AppModule implements NestModule {

    constructor(dataService: DataService) {
        dataService.prepareDataFolder();
    }

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
        consumer.apply(AuthMiddleware).forRoutes('*');
        consumer.apply(VisitorMiddleware).forRoutes('*');
    }

}
