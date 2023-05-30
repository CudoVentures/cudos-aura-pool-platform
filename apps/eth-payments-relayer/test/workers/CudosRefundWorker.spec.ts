import Config from '../../config/Config';
import Logger from '../../config/Logger';
import CudosRefundWorker from '../../src/workers/CudosRefundWorker';
import { CudosMarketsContractHappyPathMockRepo, CudosMarketsContractPaymentReturnedMockRepo } from '../mocks/CudosMarketsContractMockRepo';
import { CudosMarketsServiceHappyPathApiRepo, CudosMarketsServiceHighBlockCheckedMockRepo } from '../mocks/CudosMarketsServiceApiMockRepo';
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
        const cudosMarketsContractRepo = new CudosMarketsContractHappyPathMockRepo();
        const cudosMarketsServiceRepo = new CudosMarketsServiceHappyPathApiRepo();
        const spyRefund = jest.spyOn(cudosMarketsContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(cudosMarketsServiceRepo, 'updateLastCheckedCudosRefundBlock');

        const worker = new CudosRefundWorker(chainRpcRepo, cudosMarketsContractRepo, cudosMarketsServiceRepo);

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
        const cudosMarketsContractRepo = new CudosMarketsContractPaymentReturnedMockRepo();
        const cudosMarketsServiceRepo = new CudosMarketsServiceHappyPathApiRepo();
        const spyRefund = jest.spyOn(cudosMarketsContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(cudosMarketsServiceRepo, 'updateLastCheckedCudosRefundBlock');

        const worker = new CudosRefundWorker(chainRpcRepo, cudosMarketsContractRepo, cudosMarketsServiceRepo);

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
        const cudosMarketsContractRepo = new CudosMarketsContractHappyPathMockRepo();
        const cudosMarketsServiceRepo = new CudosMarketsServiceHappyPathApiRepo();
        const spyRefund = jest.spyOn(cudosMarketsContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(cudosMarketsServiceRepo, 'updateLastCheckedCudosRefundBlock');

        const worker = new CudosRefundWorker(chainRpcRepo, cudosMarketsContractRepo, cudosMarketsServiceRepo);

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
        const cudosMarketsContractRepo = new CudosMarketsContractHappyPathMockRepo();
        const cudosMarketsServiceRepo = new CudosMarketsServiceHappyPathApiRepo();
        const spyRefund = jest.spyOn(cudosMarketsContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(cudosMarketsServiceRepo, 'updateLastCheckedCudosRefundBlock');

        const worker = new CudosRefundWorker(chainRpcRepo, cudosMarketsContractRepo, cudosMarketsServiceRepo);

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
        const cudosMarketsContractRepo = new CudosMarketsContractHappyPathMockRepo();
        const cudosMarketsServiceRepo = new CudosMarketsServiceHighBlockCheckedMockRepo();
        const spyRefund = jest.spyOn(cudosMarketsContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(cudosMarketsServiceRepo, 'updateLastCheckedCudosRefundBlock');

        const worker = new CudosRefundWorker(chainRpcRepo, cudosMarketsContractRepo, cudosMarketsServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).toHaveBeenCalledWith('Invalid state: Last checked block higher than current Cudos block.\n\tLast checked block: 10\n\tCurrent Cudos block: 1');
        expect(spyRefund).not.toBeCalled();
        expect(spyFinish).not.toBeCalled();
    });

});
