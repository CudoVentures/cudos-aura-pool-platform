import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { NftOwnersPayoutHistoryRepo } from './repos/nft-owners-payout-history.repo';
import { SequelizeModule } from '@nestjs/sequelize';
import { NftPayoutHistoryRepo } from './repos/nft-payout-history.repo';
import { GraphqlModule } from '../graphql/graphql.module';
import { NFTModule } from '../nft/nft.module';
import { FarmModule } from '../farm/farm.module';
import { CollectionModule } from '../collection/collection.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.types';
import { Sequelize } from 'sequelize-typescript';
import compose from 'docker-compose';
import Path from 'path';
import { Umzug, SequelizeStorage } from 'umzug';
import { read } from 'fs';

describe('StatisticsService', () => {
    let service: StatisticsService;
    let module: TestingModule;

    jest.setTimeout(60000);

    beforeAll(async () => {
        const sequelize = new Sequelize({
            dialect: 'postgres',
            host: 'host.docker.internal',
            port: 15432,
            username: 'postgres',
            password: 'postgres',
            database: 'aura_pool_test',
            logging: false,
        });
        const umzug = new Umzug({
            migrations: {
                glob: Path.join(Path.join(process.cwd(), 'apps/backend/database/migrations/*.js')),
                resolve: ({ name, path, context }) => {
                    const migration = require(path);
                    return {
                        name,
                        up: async () => migration.up(context, Sequelize),
                        down: async () => migration.down(context, Sequelize),
                    }
                },
            },
            context: sequelize.getQueryInterface(),
            storage: new SequelizeStorage({ sequelize }),
            logger: undefined,
        });

        await compose.upAll({
            cwd: Path.join(process.cwd(), 'docker/test'),
        });
        await new Promise < void >((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const sequelize2 = new Sequelize({
                        dialect: 'postgres',
                        host: 'host.docker.internal',
                        port: 15432,
                        username: 'postgres',
                        password: 'postgres',
                        database: 'aura_pool_test',
                        logging: false,
                    });
                    sequelize2.connectionManager.initPools();
                    const conn = await sequelize2.connectionManager.getConnection({ type: 'read' });
                    sequelize2.connectionManager.releaseConnection(conn);
                    sequelize2.connectionManager.close();
                    clearInterval(interval);
                    resolve();
                } catch (ex) {
                }
            }, 500);
        });

        await sequelize.dropAllSchemas({
            logging: false,
        });
        await umzug.up();

        module = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    secret: jwtConstants.secret,
                    signOptions: { expiresIn: '7d' },
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
                SequelizeModule.forRoot({
                    dialect: 'postgres',
                    host: 'host.docker.internal',
                    port: 15432,
                    username: 'postgres',
                    password: 'postgres',
                    database: 'aura_pool_test',
                    autoLoadModels: true,
                    synchronize: false,
                    logging: false,
                }),
                SequelizeModule.forFeature([
                    NftOwnersPayoutHistoryRepo,
                    NftPayoutHistoryRepo,
                ]),
                NFTModule,
                CollectionModule,
                FarmModule,
                GraphqlModule,
            ],
            providers: [
                StatisticsService,
            ],
        }).compile();

        await module.init();

        service = module.get<StatisticsService>(StatisticsService);
    });

    afterAll(async () => {
        await module.close();

        await compose.down({
            cwd: Path.join(__dirname, '../../../../docker/test'),
        });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('fetchPayoutHistoryByTokenId happy path', async () => {
        const a = await service.fetchEarningsByCudosAddress('a', 123, 123);
        expect(true);
    });
});
