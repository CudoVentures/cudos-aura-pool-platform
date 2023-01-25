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
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/auth.types';
import { DataModule } from './data/data.module';
import DataService from './data/data.service';
import { GeneralModule } from './general/general.module';
import { AccountModule } from './account/account.module';
import { EmailModule } from './email/email.module';

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
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '7d' },
        }),
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
                    synchronize: true,
                }
            },
        }),
        ServeStaticModule.forRoot({
            rootPath: Path.join(__dirname, '..', '..', 'data'),
            serveRoot: DataService.LOCAL_URI_PREFIX,
        }),
        ServeStaticModule.forRoot({
            rootPath: Path.join(__dirname, '..', 'frontend', 'src', 'public'),
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['./config/.env'],
            load: [() => {
                const Config = {};
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
    providers: [AppService],
})

export class AppModule implements NestModule {

    constructor(private dataService: DataService) {
        dataService.prepareDataFolder();
    }

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(VisitorMiddleware).forRoutes('*');
        consumer.apply(AuthMiddleware).forRoutes('*');
    }

}
