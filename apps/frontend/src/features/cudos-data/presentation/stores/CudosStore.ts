import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
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

        this.inited = true;
        this.cudosDataEntity = await this.cudosRepo.fetchCudosData();
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

    convertAcudosInUsd(cudosPrice: BigNumber): BigNumber {
        return cudosPrice?.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER).multipliedBy(this.cudosDataEntity?.priceInUsd ?? 0);
    }

    convertAcudosInUsdAsString(cudosPrice: BigNumber): string {
        return this.convertAcudosInUsd(cudosPrice).toString();
    }

    formatCudosPriceChangeInPercentage(): string {
        return `${this.getCudosPriceChangeInPercentage().toFixed(2)} %`;
    }

    formatConvertedAcudosInUsd(cudosPrice: BigNumber): string {
        return numeral(this.convertAcudosInUsdAsString(cudosPrice)).format(ProjectUtils.NUMERAL_USD);
    }

}
