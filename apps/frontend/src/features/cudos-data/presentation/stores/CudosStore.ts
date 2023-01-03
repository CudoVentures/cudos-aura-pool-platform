import BigNumber from 'bignumber.js';
import { makeAutoObservable, runInAction } from 'mobx';
import numeral from 'numeral';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import CudosDataEntity from '../../entities/CudosDataEntity';
import CudosRepo from '../repos/CudosRepo';

export default class CudosStore {

    cudosRepo: CudosRepo;

    inited: boolean;
    cudosDataEntity: CudosDataEntity;

    constructor(cudosRepo: CudosRepo) {
        this.cudosRepo = cudosRepo;

        this.inited = false;
        this.cudosDataEntity = null;

        makeAutoObservable(this);
    }

    async init() {
        if (this.inited === true) {
            return;
        }

        const cudosDataEntity = await this.cudosRepo.fetchCudosData();

        runInAction(() => {
            this.inited = true;
            this.cudosDataEntity = cudosDataEntity;
        })
    }

    getCudosPriceInUsd(): number {
        return this.cudosDataEntity?.priceInUsd ?? 0;
    }

    getCudosPriceChangeInUsd(): number {
        return this.cudosDataEntity?.priceChangeInUsd ?? 0;
    }

    getCudosPriceChangeInPercentage(): number {
        const priceInUsd = this.getCudosPriceInUsd();
        const priceChangeInUsd = this.getCudosPriceChangeInUsd();

        if (priceInUsd === 0) {
            return 0;
        }

        return (priceChangeInUsd / priceInUsd) * 100;
    }

    convertAcudosInUsd(acudosPrice: BigNumber): BigNumber {
        return acudosPrice.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER).multipliedBy(this.cudosDataEntity?.priceInUsd ?? 0);
    }

    convertCudosInUsd(cudosPrice: BigNumber): BigNumber {
        return cudosPrice.multipliedBy(this.cudosDataEntity?.priceInUsd ?? 0);
    }

    convertAcudosInUsdAsString(acudosPrice: BigNumber): string {
        return this.convertAcudosInUsd(acudosPrice).toFixed(4);
    }

    static convertAcudosInCudos(acudosPrice: BigNumber): BigNumber {
        return acudosPrice.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER);
    }

    formatCudosPriceChangeInPercentage(): string {
        return `${this.getCudosPriceChangeInPercentage().toFixed(2)} %`;
    }

    formatConvertedAcudosInUsd(acudosPrice: BigNumber): string {
        return numeral(this.convertAcudosInUsdAsString(acudosPrice)).format(ProjectUtils.NUMERAL_USD);
    }

    formatConvertedCudosInUsd(cudosPrice: BigNumber): string {
        return numeral(this.convertCudosInUsd(cudosPrice)).format(ProjectUtils.NUMERAL_USD);
    }

    static formatAcudosInCudos(acudosPrice: BigNumber): string {
        return `${CudosStore.convertAcudosInCudos(acudosPrice)} CUDOS`;
    }
}
