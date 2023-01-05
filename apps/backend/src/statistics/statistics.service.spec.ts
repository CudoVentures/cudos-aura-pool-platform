import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { NftOwnersPayoutHistoryRepo } from './repos/nft-owners-payout-history.repo';
import { SequelizeModule } from '@nestjs/sequelize';
import { NftPayoutHistoryRepo } from './repos/nft-payout-history.repo';
import { GraphqlModule } from '../graphql/graphql.module';
import { NFTModule } from '../nft/nft.module';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('StatisticsService', () => {
    let service: StatisticsService;
    let module: TestingModule

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                NFTModule,
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
                            logging: false,
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

    afterEach(async () => {
        await module.close();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('fetchPayoutHistoryByTokenId happy path', async () => {
        const a = await service.fetchEarningsByCudosAddress('a', 123, 123);
        expect(true);
    })
});
