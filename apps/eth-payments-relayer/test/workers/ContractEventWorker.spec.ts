import Config from '../../config/Config';
import Logger from '../../config/Logger';
import ContractEventWorker from '../../src/workers/ContractEventWorker';
import { CudosMarketsContractHappyPathMockRepo, CudosMarketsContractLowBlockHeightMockRepo, CudosMarketsContractPaymentReturnedMockRepo, CudosMarketsContractWrongAmountMockRepo } from '../mocks/CudosMarketsContractMockRepo';
import { CudosMarketsServiceHappyPathApiRepo, CudosMarketsServiceHighBlockCheckedMockRepo } from '../mocks/CudosMarketsServiceApiMockRepo';
import { CudosChainRpcFailToMintMockRepo, CudosChainRpcHappyPathMockRepo, CudosChainRpcNoAddressbookEntryMockRepo } from '../mocks/CudosChainRpcMockRepo';

describe('ContractEventWorker (e2e)', () => {
    const logErrorSpy = jest.spyOn(ContractEventWorker, 'error');
    const logWarn = jest.spyOn(ContractEventWorker, 'warn');

    beforeAll(async () => {
        Config.EXPECTED_PRICE_USD = 1;
        Config.EXPECTED_PRICE_EPSILON_PERCENT = 0.01;
        Logger.transports.forEach((t) => { t.silent = true });
    });

    it('Mint: HappyPath', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcHappyPathMockRepo();
        const cudosMarketsContractRepo = new CudosMarketsContractHappyPathMockRepo();
        const cudosMarketsServiceRepo = new CudosMarketsServiceHappyPathApiRepo();
        const spyRefund = jest.spyOn(cudosMarketsContractRepo, 'markPaymentWithdrawable');
        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyFinish = jest.spyOn(cudosMarketsServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, cudosMarketsContractRepo, cudosMarketsServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).not.toBeCalled();
        expect(spyRefund).not.toBeCalled();
        expect(spyMint).toBeCalledTimes(6);
        expect(spyFinish).toBeCalled();
    });

    it('Refund: payment not equal to expected', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcHappyPathMockRepo();
        const cudosMarketsContractRepo = new CudosMarketsContractWrongAmountMockRepo();
        const cudosMarketsServiceRepo = new CudosMarketsServiceHappyPathApiRepo();

        const spyRefund = jest.spyOn(cudosMarketsContractRepo, 'markPaymentWithdrawable');
        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyFinish = jest.spyOn(cudosMarketsServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, cudosMarketsContractRepo, cudosMarketsServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).not.toBeCalled();
        expect(logWarn).toHaveBeenCalledWith('\tPayed amount to contract is not within the expected band.\n\t\tPayed amount: 123\n\t\tExpected to be between: 0.99 AND 1.01');
        expect(spyRefund).toBeCalledTimes(6);
        expect(spyMint).not.toBeCalled();
        expect(spyFinish).toBeCalled();
    });

    // it('Refund: no addressbook entry', async () => {
    //     // Arrange
    //     const chainRpcRepo = new CudosChainRpcNoAddressbookEntryMockRepo();
    //     const cudosMarketsContractRepo = new CudosMarketsContractHappyPathMockRepo();
    //     const cudosMarketsServiceRepo = new CudosMarketsServiceHappyPathApiRepo();

    //     const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
    //     const spyRefund = jest.spyOn(cudosMarketsContractRepo, 'markPaymentWithdrawable');
    //     const spyFinish = jest.spyOn(cudosMarketsServiceRepo, 'updateLastCheckedEthereumBlock');

    //     const worker = new ContractEventWorker(chainRpcRepo, cudosMarketsContractRepo, cudosMarketsServiceRepo);

    //     // Act
    //     await expect(worker.run()).resolves.not.toThrowError();

    //     // Assert
    //     expect(logErrorSpy).not.toHaveBeenCalled();
    //     expect(logWarn).toHaveBeenCalledWith('\tAddressbook entry not found for payment nft id.\n\t\tPayment cudos address: address1');
    //     expect(spyRefund).toBeCalledTimes(6);
    //     expect(spyMint).not.toBeCalled();
    //     expect(spyFinish).toBeCalled();
    // })

    it('Refund: payment refunded already', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcNoAddressbookEntryMockRepo();
        const cudosMarketsContractRepo = new CudosMarketsContractPaymentReturnedMockRepo();
        const cudosMarketsServiceRepo = new CudosMarketsServiceHappyPathApiRepo();

        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyRefund = jest.spyOn(cudosMarketsContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(cudosMarketsServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, cudosMarketsContractRepo, cudosMarketsServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).not.toHaveBeenCalled();
        expect(spyRefund).not.toBeCalled();
        expect(spyMint).not.toBeCalled();
        expect(spyFinish).toBeCalled();
    })

    it('Do Nothing: no new block', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcHappyPathMockRepo();
        const cudosMarketsContractRepo = new CudosMarketsContractLowBlockHeightMockRepo();
        const cudosMarketsServiceRepo = new CudosMarketsServiceHappyPathApiRepo();

        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyRefund = jest.spyOn(cudosMarketsContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(cudosMarketsServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, cudosMarketsContractRepo, cudosMarketsServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).not.toHaveBeenCalled();
        expect(spyRefund).not.toBeCalled();
        expect(spyMint).not.toBeCalled();
        expect(spyFinish).not.toBeCalled();
    })

    it('Error: failed to send minting tx', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcFailToMintMockRepo();
        const cudosMarketsContractRepo = new CudosMarketsContractHappyPathMockRepo();
        const cudosMarketsServiceRepo = new CudosMarketsServiceHappyPathApiRepo();

        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyRefund = jest.spyOn(cudosMarketsContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(cudosMarketsServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, cudosMarketsContractRepo, cudosMarketsServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).toHaveBeenCalledTimes(1);
        expect(spyRefund).not.toBeCalled();
        expect(spyMint).toBeCalled();
        expect(spyFinish).not.toBeCalled();
    })

    it('Error: invalid block', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcHappyPathMockRepo();
        const cudosMarketsContractRepo = new CudosMarketsContractLowBlockHeightMockRepo();
        const cudosMarketsServiceRepo = new CudosMarketsServiceHighBlockCheckedMockRepo();

        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyRefund = jest.spyOn(cudosMarketsContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(cudosMarketsServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, cudosMarketsContractRepo, cudosMarketsServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).toHaveBeenCalledTimes(2);
        expect(spyRefund).not.toBeCalled();
        expect(spyMint).not.toBeCalled();
        expect(spyFinish).not.toBeCalled();
    })

});
