import * as request from 'supertest';
import Logger from '../../config/Logger';
import ContractEventWorker from '../../src/workers/ContractEventWorker';
import { AuraContractHappyPathMockRepo, AuraContractLowBlockHeightMockRepo, AuraContractPaymentReturnedMockRepo } from '../mocks/AuraContractMockRepo';
import { CudosAuraPoolServiceApiNoNftsFoundMockRepo, CudosAuraPoolServiceDifferentPriceApiRepo, CudosAuraPoolServiceHappyPathApiRepo, CudosAuraPoolServiceHighBlockCheckedMockRepo } from '../mocks/CudosAuraPoolServiceApiMockRepo';
import { CudosChainRpcFailToMintMockRepo, CudosChainRpcHappyPathMockRepo, CudosChainRpcNoAddressbookEntryMockRepo } from '../mocks/CudosChainRpcMockRepo';

describe('ContractEventWorker (e2e)', () => {
    const logErrorSpy = jest.spyOn(ContractEventWorker, 'error');
    const logErrorWarn = jest.spyOn(ContractEventWorker, 'warn');

    beforeEach(async () => {
    });

    it('Mint: HappyPath', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcHappyPathMockRepo();
        const auraContractRepo = new AuraContractHappyPathMockRepo();
        const auraPoolServiceRepo = new CudosAuraPoolServiceHappyPathApiRepo();
        const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

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
        const auraContractRepo = new AuraContractHappyPathMockRepo();
        const auraPoolServiceRepo = new CudosAuraPoolServiceDifferentPriceApiRepo();

        const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).not.toBeCalled();
        expect(logErrorWarn).toHaveBeenCalledWith('\tPayed amount to contract is not equal to the expected.\n\t\tNftId: id1\n\t\tPayed amount: 0.0001\n\t\tExpected amount: 123');
        expect(spyRefund).toBeCalledTimes(6);
        expect(spyMint).not.toBeCalled();
        expect(spyFinish).toBeCalled();
    });

    it('Refund: nft not found by id', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcHappyPathMockRepo();
        const auraContractRepo = new AuraContractHappyPathMockRepo();
        const auraPoolServiceRepo = new CudosAuraPoolServiceApiNoNftsFoundMockRepo();

        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).not.toBeCalled();
        expect(logErrorWarn).toHaveBeenCalledWith('\tNft entity with id id6 not fetched.');
        expect(spyRefund).toBeCalledTimes(6);
        expect(spyMint).not.toBeCalled();
        expect(spyFinish).toBeCalled();
    })

    it('Refund: no addressbook entry', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcNoAddressbookEntryMockRepo();
        const auraContractRepo = new AuraContractHappyPathMockRepo();
        const auraPoolServiceRepo = new CudosAuraPoolServiceHappyPathApiRepo();

        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).not.toHaveBeenCalled();
        expect(logErrorWarn).toHaveBeenCalledWith('\tAddressbook entry not found for payment nft id.\n\t\tNftId: id1\n\t\tPayment cudos address: address1');
        expect(spyRefund).toBeCalledTimes(6);
        expect(spyMint).not.toBeCalled();
        expect(spyFinish).toBeCalled();
    })

    it('Refund: payment refunded already', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcNoAddressbookEntryMockRepo();
        const auraContractRepo = new AuraContractPaymentReturnedMockRepo();
        const auraPoolServiceRepo = new CudosAuraPoolServiceHappyPathApiRepo();

        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).not.toHaveBeenCalled();
        expect(spyRefund).not.toBeCalled();
        expect(spyMint).not.toBeCalled();
        expect(spyFinish).toBeCalled();
    })

    // it('Do Nothing: no new block', async () => {
    //     // Arrange
    //     const chainRpcRepo = new CudosChainRpcHappyPathMockRepo();
    //     const auraContractRepo = new AuraContractLowBlockHeightMockRepo();
    //     const auraPoolServiceRepo = new CudosAuraPoolServiceHappyPathApiRepo();

    //     const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
    //     const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
    //     const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedEthereumBlock');

    //     const worker = new ContractEventWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

    //     // Act
    //     await expect(worker.run()).resolves.not.toThrowError();

    //     // Assert
    //     expect(logErrorSpy).not.toHaveBeenCalled();
    //     expect(spyRefund).not.toBeCalled();
    //     expect(spyMint).not.toBeCalled();
    //     expect(spyFinish).not.toBeCalled();
    // })

    it('Error: failed to send minting tx', async () => {
        // Arrange
        const chainRpcRepo = new CudosChainRpcFailToMintMockRepo();
        const auraContractRepo = new AuraContractHappyPathMockRepo();
        const auraPoolServiceRepo = new CudosAuraPoolServiceHappyPathApiRepo();

        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

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
        const auraContractRepo = new AuraContractLowBlockHeightMockRepo();
        const auraPoolServiceRepo = new CudosAuraPoolServiceHighBlockCheckedMockRepo();

        const spyMint = jest.spyOn(chainRpcRepo, 'sendOnDemandMintingTx');
        const spyRefund = jest.spyOn(auraContractRepo, 'markPaymentWithdrawable');
        const spyFinish = jest.spyOn(auraPoolServiceRepo, 'updateLastCheckedEthereumBlock');

        const worker = new ContractEventWorker(chainRpcRepo, auraContractRepo, auraPoolServiceRepo);

        // Act
        await expect(worker.run()).resolves.not.toThrowError();

        // Assert
        expect(logErrorSpy).toHaveBeenCalledTimes(2);
        expect(spyRefund).not.toBeCalled();
        expect(spyMint).not.toBeCalled();
        expect(spyFinish).not.toBeCalled();
    })

});
