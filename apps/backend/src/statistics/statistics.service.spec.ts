import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { NftOwnersPayoutHistoryRepo } from './repos/nft-owners-payout-history.repo';
import { SequelizeModule, getModelToken } from '@nestjs/sequelize';
import { NftPayoutHistoryRepo } from './repos/nft-payout-history.repo';
import { GraphqlModule } from '../graphql/graphql.module';
import { NFTModule } from '../nft/nft.module';
import { FarmModule } from '../farm/farm.module';
import { CollectionModule } from '../collection/collection.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.types';
import { emptyStatisticsTestData, fillStatisticsTestData } from './utils/test.utils';

describe('StatisticsService', () => {
    let service: StatisticsService;
    let module: TestingModule;

    beforeAll(async () => {
        // const sequelize = new Sequelize({
        //     dialect: 'sqlite',
        //     storage: ':memory:',
        // });
        // sequelize.addModels([
        //     NftOwnersPayoutHistoryRepo,
        //     NftPayoutHistoryRepo,
        // ]);
        // sequelize.getQueryInterface();

        // await sequelize.sync();

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
                    port: 5432,
                    username: 'postgres',
                    password: 'postgres',
                    database: 'aura_pool',
                    autoLoadModels: true,
                    synchronize: true,
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
    });

    beforeEach(async () => {
        await fillStatisticsTestData();
    })

    afterEach(async () => {
        await emptyStatisticsTestData();
    })

    it('should be defined', async () => {
        expect(service).toBeDefined();
    });

    it('fetchPayoutHistoryByTokenId happy path', async () => {
        const a = await service.fetchEarningsByCudosAddress('a', 123, 123);
        expect(true);
    });
});
