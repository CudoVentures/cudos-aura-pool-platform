import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { NftOwnersPayoutHistoryRepo } from './repos/nft-owners-payout-history.repo';
import { SequelizeModule } from '@nestjs/sequelize';
import { NftPayoutHistoryRepo, NftPayoutHistoryRepoColumn } from './repos/nft-payout-history.repo';
import { GraphqlModule } from '../graphql/graphql.module';
import { NFTModule } from '../nft/nft.module';
import { FarmModule } from '../farm/farm.module';
import { CollectionModule } from '../collection/collection.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.types';
import { emptyStatisticsTestData, fillStatisticsTestData, getZeroDatePlusDaysTimestamp } from './utils/test.utils';
import compose from 'docker-compose';
import Path from 'path';
import UserEarningsEntity from './entities/user-earnings.entity';

describe('StatisticsService', () => {
    const testDbDockerPath = Path.join(process.cwd(), 'docker/test');
    let service: StatisticsService;
    let module: TestingModule;

    jest.setTimeout(6000000);

    beforeAll(async () => {
        await compose.upAll({
            cwd: testDbDockerPath,
        });

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

        await compose.down({
            cwd: testDbDockerPath,
        });
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
        const expectedUserEraningsEntity = UserEarningsEntity.fromJson({
            totalEarningInBtc: '15',
            totalNftBought: 5,
            totalContractHashPowerInTh: 15,
            earningsPerDayInBtc: [
                '0',
                '0',
                '0',
            ],
            btcEarnedInBtc: '0',
        });

        const userEarningsEntity = await service.fetchEarningsByCudosAddress('testowner', getZeroDatePlusDaysTimestamp(2), getZeroDatePlusDaysTimestamp(5));

        expect(userEarningsEntity).toEqual(expectedUserEraningsEntity);
    });
});
