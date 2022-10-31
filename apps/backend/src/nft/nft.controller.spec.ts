import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CollectionController } from '../collection/collection.controller';
import { CollectionService } from '../collection/collection.service';
import { CollectionStatus } from '../collection/utils';
import { FarmStatus } from '../farm/farm.model';
import { FarmService } from '../farm/farm.service';
import { IsApprovedGuard } from './guards/is-approved.guard';
import { NFTService } from './nft.service';

describe('NFTController', () => {
  let controller: CollectionController;
  let service: NFTService;
  let collectionService: CollectionService;
  let isApprovedGuard: IsApprovedGuard;
  let farmService: FarmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [
        {
          provide: CollectionService,
          useValue: {
            createOne: jest.fn((x) => x),
            findOne: jest.fn(async (collectionId: number) => {
              switch (collectionId) {
                case 0:
                  return { status: CollectionStatus.QUEUED, farm_id: 0 };
                case 1:
                  return { status: CollectionStatus.QUEUED, farm_id: 1 };
                default:
                  return { status: CollectionStatus.APPROVED, farm_id: 1 };
              }
            }),
          },
        },
        {
          provide: NFTService,
          useValue: {
            findOne: jest.fn(async (nftId: number) => {
              switch (nftId) {
                case 0:
                  return { collection_id: 0 };
                case 1:
                  return { collection_id: 1 };
                default:
                  return { collection_id: 2 };
              }
            }),
          },
        },
        {
          provide: FarmService,
          useValue: {
            findOne: jest.fn(async (farmId: number) => {
              return farmId === 0
                ? { status: FarmStatus.QUEUED }
                : { status: FarmStatus.APPROVED };
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<CollectionController>(CollectionController);
    service = module.get<NFTService>(NFTService);
    collectionService = module.get<CollectionService>(CollectionService);
    farmService = module.get<FarmService>(FarmService);
    isApprovedGuard = new IsApprovedGuard(
      service,
      collectionService,
      farmService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(collectionService).toBeDefined();
    expect(farmService).toBeDefined();
    expect(isApprovedGuard).toBeDefined();
  });

  describe('test isApprovedGuard', () => {
    describe('create nft', () => {
      it('should throw an error (unverified farm/unverified collection)', async () => {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'POST',
              params: {
                id: 0,
              },
              body: {
                collection_id: 0,
              },
            }),
          }),
        });

        try {
          await isApprovedGuard.canActivate(mockContext);
        } catch (err) {
          expect(err).toBeInstanceOf(UnauthorizedException);
        }
      });

      it('should throw an error (verified farm/unverified collection)', async () => {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'POST',
              params: {
                id: 1,
              },
              body: {
                collection_id: 1,
              },
            }),
          }),
        });

        try {
          await isApprovedGuard.canActivate(mockContext);
        } catch (err) {
          expect(err).toBeInstanceOf(UnauthorizedException);
        }
      });

      it('should return true', async () => {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'POST',
              params: {
                id: 2,
              },
              body: {
                collection_id: 2,
              },
            }),
          }),
        });

        const canActivateRes = await isApprovedGuard.canActivate(mockContext);
        expect(canActivateRes).toEqual(true);
      });
    });

    describe('edit nft', () => {
      it('should throw an error (unverified farm/unverified collection)', async () => {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'PUT',
              params: {
                id: 0,
              },
              body: {
                collection_id: 0,
                name: 'new name',
              },
            }),
          }),
        });

        try {
          await isApprovedGuard.canActivate(mockContext);
        } catch (err) {
          expect(err).toBeInstanceOf(UnauthorizedException);
        }
      });

      it('should throw an error (verified farm/unverified collection)', async () => {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'PUT',
              params: {
                id: 1,
              },
              body: {
                collection_id: 1,
                name: 'new name',
              },
            }),
          }),
        });

        try {
          await isApprovedGuard.canActivate(mockContext);
        } catch (err) {
          expect(err).toBeInstanceOf(UnauthorizedException);
        }
      });

      it('should return true', async () => {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'PUT',
              params: {
                id: 2,
              },
              body: {
                collection_id: 2,
                name: 'new name',
              },
            }),
          }),
        });

        const canActivateRes = await isApprovedGuard.canActivate(mockContext);
        expect(canActivateRes).toEqual(true);
      });
    });

    describe('delete nft', () => {
      it('should throw an error (unverified farm/unverified collection)', async () => {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'DELETE',
              params: {
                id: 0,
              },
              body: {
                collection_id: 0,
              },
            }),
          }),
        });

        try {
          await isApprovedGuard.canActivate(mockContext);
        } catch (err) {
          expect(err).toBeInstanceOf(UnauthorizedException);
        }
      });

      it('should throw an error (verified farm/unverified collection)', async () => {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'DELETE',
              params: {
                id: 1,
              },
              body: {
                collection_id: 1,
              },
            }),
          }),
        });

        try {
          await isApprovedGuard.canActivate(mockContext);
        } catch (err) {
          expect(err).toBeInstanceOf(UnauthorizedException);
        }
      });

      it('should return true', async () => {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'DELETE',
              params: {
                id: 2,
              },
              body: {
                collection_id: 2,
              },
            }),
          }),
        });

        const canActivateRes = await isApprovedGuard.canActivate(mockContext);
        expect(canActivateRes).toEqual(true);
      });
    });
  });
});
