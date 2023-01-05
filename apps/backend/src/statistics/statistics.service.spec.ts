import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { NftOwnersPayoutHistoryRepo } from './repos/nft-owners-payout-history.repo';
import { SequelizeModule } from '@nestjs/sequelize';
import { NftPayoutHistoryRepo } from './repos/nft-payout-history.repo';
import { NftModule } from 'cudosjs/build/stargate/modules/nft/module';
import { GraphqlModule } from '../graphql/graphql.module';

const moduleMocker = new ModuleMocker(global);

describe('StatisticsService', () => {
    let service: StatisticsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                NftModule,
                GraphqlModule,
                SequelizeModule.forRootAsync({
                    useFactory: () => {
                        return {
                            dialect: 'postgres',
                            host: 'host.docker.internal',
                            port: 5432,
                            username: 'postgres',
                            password: 'postgres',
                            database: 'aura_pool',
                            autoLoadModels: true,
                            synchronize: true,
                        }
                    },
                }),
                SequelizeModule.forFeature([
                    NftPayoutHistoryRepo,
                    NftOwnersPayoutHistoryRepo,
                ]),
            ],
            providers: [
                StatisticsService,
            ],
        }).useMocker((token) => {
            const results = ['test1', 'test2'];
            if (token === NftOwnersPayoutHistoryRepo) {
                return { findAll: jest.fn().mockResolvedValue(results) };
            }
            if (typeof token === 'function') {
                const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
                const Mock = moduleMocker.generateFromMetadata(mockMetadata);
                return new Mock();
            }
        }).compile();

        service = module.get<StatisticsService>(StatisticsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('fetchPayoutHistoryByTokenId happy path', async () => {
        const a = await service.fetchEarningsByCudosAddress('a', 123, 123);

        console.log(a);
        expect(true);
    })
});
