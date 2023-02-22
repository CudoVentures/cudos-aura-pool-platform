import Config from '../../config/Config';
import Logger from '../../config/Logger';
import CudosRefundWorker from '../../src/workers/CudosRefundWorker';
import { AuraContractHappyPathMockRepo, AuraContractPaymentReturnedMockRepo } from '../mocks/AuraContractMockRepo';
import { CudosAuraPoolServiceHappyPathApiRepo, CudosAuraPoolServiceHighBlockCheckedMockRepo } from '../mocks/CudosAuraPoolServiceApiMockRepo';
import { CudosChainRpcHappyPathMockRepo, CudosChainRpcInvalidOriginalTxMockRepo, CudosChainRpcLowBlockMockRepo, CudosChainRpcNoEventsMockRepo } from '../mocks/CudosChainRpcMockRepo';

describe('CudosRefundWorker (e2e)', () => {
    const logErrorSpy = jest.spyOn(CudosRefundWorker, 'error');
    const logWarnSpy = jest.spyOn(CudosRefundWorker, 'warn');

    beforeEach(async () => {
        Logger.transports.forEach((t) => { t.silent = true });
        Config.getCudosSignerAddress = async () => {
            return 'testCudosSignerAddress';
        }
        Config.MINTING_SERVICE_ADDRESS = 'testMintingServiceAddress';
    });

    it('Refund: HappyPath', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcHappyPathMockRepo();
        const auraContractRepo = new AuraContractHappyPathMockRepo();
        const auraPoolServiceRepo = new CudosAuraPoolServiceHappyPathApiRepo();
        const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedCudosRefundBlock');

        const worker = new CudosRefundWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).not.toBeCalled();
        expect(spyRefund).toBeCalled();
        expect(spyFinish).toBeCalled();
    });

    it('Refund: already marked for refund', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcHappyPathMockRepo();
        const auraContractRepo = new AuraContractPaymentReturnedMockRepo();
        const auraPoolServiceRepo = new CudosAuraPoolServiceHappyPathApiRepo();
        const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedCudosRefundBlock');

        const worker = new CudosRefundWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).not.toBeCalled();
        expect(spyRefund).not.toBeCalled();
        expect(spyFinish).toBeCalled();
    });

    it('No refund: no events', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcNoEventsMockRepo();
        const auraContractRepo = new AuraContractHappyPathMockRepo();
        const auraPoolServiceRepo = new CudosAuraPoolServiceHappyPathApiRepo();
        const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedCudosRefundBlock');

        const worker = new CudosRefundWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).not.toBeCalled();
        expect(spyRefund).not.toBeCalled();
        expect(spyFinish).toBeCalled();
    });

    it('Error: invalid original payment transaction found', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcInvalidOriginalTxMockRepo();
        const auraContractRepo = new AuraContractHappyPathMockRepo();
        const auraPoolServiceRepo = new CudosAuraPoolServiceHappyPathApiRepo();
        const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedCudosRefundBlock');

        const worker = new CudosRefundWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logWarnSpy).toBeCalledWith('Invalid transaction parsed:\n\tTxHash: refundTx\n\tParsed entity: null');
        expect(spyRefund).not.toBeCalled();
        expect(spyFinish).toBeCalled();
    });

    it('Error: invalid blocks', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcLowBlockMockRepo();
        const auraContractRepo = new AuraContractHappyPathMockRepo();
        const auraPoolServiceRepo = new CudosAuraPoolServiceHighBlockCheckedMockRepo();
        const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedCudosRefundBlock');

        const worker = new CudosRefundWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).toHaveBeenCalledWith('Invalid state: Last checked block higher than current Cudos block.\n\tLast checked block: 10\n\tCurrent Cudos block: 1');
        expect(spyRefund).not.toBeCalled();
        expect(spyFinish).not.toBeCalled();
    });

});
