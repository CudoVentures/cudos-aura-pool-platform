import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FarmStatus } from '../farm/farm.model';
import { FarmService } from '../farm/farm.service';
import { NFTService } from '../nft/nft.service';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { IsApprovedGuard } from './guards/is-approved.guard';

describe('CollectionController', () => {
  let controller: CollectionController;
  let service: CollectionService;
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
              return collectionId === 0 ? { farm_id: 0 } : { farm_id: 1 };
            }),
          },
        },
        {
          provide: NFTService,
          useValue: {},
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
    service = module.get<CollectionService>(CollectionService);
    farmService = module.get<FarmService>(FarmService);
    isApprovedGuard = new IsApprovedGuard(service, farmService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(farmService).toBeDefined();
    expect(isApprovedGuard).toBeDefined();
  });

  describe('test isApprovedGuard', () => {
    describe('create collection', () => {
      it('should throw an error', async () => {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'POST',
              params: {
                id: 0,
              },
              body: {
                farm_id: 0,
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
                id: 1,
              },
              body: {
                farm_id: 1,
              },
            }),
          }),
        });

        const canActivateRes = await isApprovedGuard.canActivate(mockContext);
        expect(canActivateRes).toEqual(true);
      });
    });

    describe('edit collection', () => {
      it('should throw an error', async () => {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'PUT',
              params: {
                id: 0,
              },
              body: {
                farm_id: 0,
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
                id: 1,
              },
              body: {
                farm_id: 1,
                name: 'new name',
              },
            }),
          }),
        });

        const canActivateRes = await isApprovedGuard.canActivate(mockContext);
        expect(canActivateRes).toEqual(true);
      });
    });

    describe('delete collection', () => {
      it('should throw an error', async () => {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'DELETE',
              params: {
                id: 0,
              },
              body: {
                farm_id: 0,
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
                id: 1,
              },
              body: {
                farm_id: 1,
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
