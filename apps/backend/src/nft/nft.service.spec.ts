import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { GraphqlModule } from '../graphql/graphql.module';
import { NFTModule } from './nft.module';
import { FarmModule } from '../farm/farm.module';
import { CollectionModule } from '../collection/collection.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.types';
import compose from 'docker-compose';
import Path from 'path';
import { NftRepo } from './repos/nft.repo';
import { NFTService } from './nft.service';
import { VisitorModule } from '../visitor/visitor.module';
import { CoinGeckoModule } from '../coin-gecko/coin-gecko.module';
import NftEntity from './entities/nft.entity';
import CoinGeckoService from '../coin-gecko/coin-gecko.service';
import BigNumber from 'bignumber.js';

describe('NFTService', () => {
    const oneCudosInAcudos = new BigNumber('1000000000000000000')
    const testDbDockerPath = Path.join(process.cwd(), 'docker/test');
    let service: NFTService;
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

                        process.env['APP_PRESALE_COLLECTION_ID'] = '1';
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
                    NftRepo,
                ]),
                NFTModule,
                CollectionModule,
                FarmModule,
                GraphqlModule,
                CoinGeckoModule,
                VisitorModule,
            ],
            providers: [
                NFTService,
            ],
        }).compile();

        await module.init();

        service = module.get<NFTService>(NFTService);
        const coinGeckoService = module.get<CoinGeckoService>(CoinGeckoService);
        jest.spyOn(coinGeckoService, 'fetchCudosPrice').mockImplementation(async () => {
            return {
                cudosUsdPrice: Number(1),
                cudosEthPrice: new BigNumber(1),
            }
        });

        process.env.APP_PRESALE_PRICE_USD = '1';
        process.env.APP_PRESALE_EXPECTED_PRICE_EPSILON = '0.01';
    });

    afterAll(async () => {
        await module.close();

        await compose.down({
            cwd: testDbDockerPath,
        });
    });

    it('Should be defined', async () => {
        expect(service).toBeDefined();
    });

    it('getRandomPresaleNft: should have expected distribution', async () => {
        // Arrange
        const nftEntities = [];
        const totalFetches = 100000;
        const expectedTier5Count = totalFetches * 0.5;
        const expectedTier4Count = totalFetches * 0.2;
        const expectedTier3Count = totalFetches * 0.15;
        const expectedTier2Count = totalFetches * 0.10;
        const expectedTier1Count = totalFetches * 0.05;
        const countE = 0.05;

        jest.spyOn(service, 'findAllPremintByCollectionAndPriceUsd').mockImplementation(async (collectionId, price) => {
            const nftEntity = new NftEntity();
            nftEntity.priceUsd = price;
            return [nftEntity];
        });

        // Act
        for (let i = 0; i < totalFetches; i++) {
            const nftEntity = await service.getRandomPresaleNft(oneCudosInAcudos);
            nftEntities.push(nftEntity);
        }

        // Assert
        const tier5EntitiesCount = nftEntities.filter((entity) => entity.priceUsd === 300).length;
        const tier4EntitiesCount = nftEntities.filter((entity) => entity.priceUsd === 500).length;
        const tier3EntitiesCount = nftEntities.filter((entity) => entity.priceUsd === 1000).length;
        const tier2EntitiesCount = nftEntities.filter((entity) => entity.priceUsd === 2000).length;
        const tier1EntitiesCount = nftEntities.filter((entity) => entity.priceUsd === 3000).length;

        // Assert
        expect(expectedTier5Count * (1 - countE) <= tier5EntitiesCount && tier5EntitiesCount <= expectedTier5Count * (1 + countE)).toBeTruthy();
        expect(expectedTier4Count * (1 - countE) <= tier4EntitiesCount && tier4EntitiesCount <= expectedTier4Count * (1 + countE)).toBeTruthy();
        expect(expectedTier3Count * (1 - countE) <= tier3EntitiesCount && tier3EntitiesCount <= expectedTier3Count * (1 + countE)).toBeTruthy();
        expect(expectedTier2Count * (1 - countE) <= tier2EntitiesCount && tier2EntitiesCount <= expectedTier2Count * (1 + countE)).toBeTruthy();
        expect(expectedTier1Count * (1 - countE) <= tier1EntitiesCount && tier1EntitiesCount <= expectedTier1Count * (1 + countE)).toBeTruthy();
    })

    it('getRandomPresaleNft: tier2 finished, tier1 should be minted instead', async () => {
        // Arrange
        const nftEntities = [];
        const totalFetches = 100000;
        const expectedTier5Count = totalFetches * 0.5;
        const expectedTier4Count = totalFetches * 0.2;
        const expectedTier3Count = totalFetches * 0.15;
        const expectedTier1Count = totalFetches * 0.15;
        const countE = 0.05;

        jest.spyOn(service, 'findAllPremintByCollectionAndPriceUsd').mockImplementation(async (collectionId, price) => {
            if (price === 2000) {
                return [];
            }

            const nftEntity = new NftEntity();
            nftEntity.priceUsd = price;
            return [nftEntity];
        });

        // Act
        for (let i = 0; i < totalFetches; i++) {
            const nftEntity = await service.getRandomPresaleNft(oneCudosInAcudos);
            nftEntities.push(nftEntity);
        }

        // Assert
        const tier5EntitiesCount = nftEntities.filter((entity) => entity.priceUsd === 300).length;
        const tier4EntitiesCount = nftEntities.filter((entity) => entity.priceUsd === 500).length;
        const tier3EntitiesCount = nftEntities.filter((entity) => entity.priceUsd === 1000).length;
        const tier1EntitiesCount = nftEntities.filter((entity) => entity.priceUsd === 3000).length;

        // Assert
        expect(expectedTier5Count * (1 - countE) <= tier5EntitiesCount && tier5EntitiesCount <= expectedTier5Count * (1 + countE)).toBeTruthy();
        expect(expectedTier4Count * (1 - countE) <= tier4EntitiesCount && tier4EntitiesCount <= expectedTier4Count * (1 + countE)).toBeTruthy();
        expect(expectedTier3Count * (1 - countE) <= tier3EntitiesCount && tier3EntitiesCount <= expectedTier3Count * (1 + countE)).toBeTruthy();
        expect(expectedTier1Count * (1 - countE) <= tier1EntitiesCount && tier1EntitiesCount <= expectedTier1Count * (1 + countE)).toBeTruthy();
    })

    it('getRandomPresaleNft: tiers 2 and 1 finished, tier 3 should be minted instead of them', async () => {
        // Arrange
        const nftEntities = [];
        const totalFetches = 100000;
        const expectedTier5Count = totalFetches * 0.5;
        const expectedTier4Count = totalFetches * 0.2;
        const expectedTier3Count = totalFetches * 0.30;
        const countE = 0.05;

        jest.spyOn(service, 'findAllPremintByCollectionAndPriceUsd').mockImplementation(async (collectionId, price) => {
            if (price === 2000 || price === 3000) {
                return [];
            }

            const nftEntity = new NftEntity();
            nftEntity.priceUsd = price;
            return [nftEntity];
        });

        // Act
        for (let i = 0; i < totalFetches; i++) {
            const nftEntity = await service.getRandomPresaleNft(oneCudosInAcudos);
            nftEntities.push(nftEntity);
        }

        // Assert
        const tier5EntitiesCount = nftEntities.filter((entity) => entity.priceUsd === 300).length;
        const tier4EntitiesCount = nftEntities.filter((entity) => entity.priceUsd === 500).length;
        const tier3EntitiesCount = nftEntities.filter((entity) => entity.priceUsd === 1000).length;

        // Assert
        expect(expectedTier5Count * (1 - countE) <= tier5EntitiesCount && tier5EntitiesCount <= expectedTier5Count * (1 + countE)).toBeTruthy();
        expect(expectedTier4Count * (1 - countE) <= tier4EntitiesCount && tier4EntitiesCount <= expectedTier4Count * (1 + countE)).toBeTruthy();
        expect(expectedTier3Count * (1 - countE) <= tier3EntitiesCount && tier3EntitiesCount <= expectedTier3Count * (1 + countE)).toBeTruthy();
    })

    it('getRandomPresaleNft: payment amount outside epsilon', async () => {
        // Assert
        expect(await service.getRandomPresaleNft(oneCudosInAcudos.plus(oneCudosInAcudos))).toEqual(null);
    })

});
