import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import numeral from 'numeral';
import { CURRENCY_DECIMALS } from 'cudosjs';
import ProjectUtils, { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import NftEntity from '../../../nft/entities/NftEntity';
import CudosDataEntity from '../../entities/CudosDataEntity';
import CudosRepo from '../repos/CudosRepo';
import S from '../../../core/utilities/Main';

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

        await runInActionAsync(() => {
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

    convertCudosToEth(cudosAmount: BigNumber): BigNumber {
        return cudosAmount.multipliedBy(this.cudosDataEntity.priceInEth);
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

    convertUsdInAcudos(dollars: number): BigNumber {
        return ProjectUtils.CUDOS_CURRENCY_DIVIDER.multipliedBy(dollars).dividedBy(this.cudosDataEntity?.priceInUsd ?? 0);
    }

    convertUsdInCudos(dollars: number): BigNumber {
        return dollars === S.NOT_EXISTS ? new BigNumber(0) : this.convertUsdInAcudos(dollars).shiftedBy(-CURRENCY_DECIMALS);
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
        return numeral(this.convertCudosInUsd(cudosPrice).toString(10)).format(ProjectUtils.NUMERAL_USD);
    }

    getEthPriceForNft(nftEntity: NftEntity): BigNumber {
        return this.convertCudosToEth(this.getNftCudosPriceForNft(nftEntity));
    }

    getNftCudosPriceForNft(nftEntity: NftEntity): BigNumber {
        if (nftEntity.isMinted() === true) {
            if (nftEntity.priceInAcudos === null) {
                return new BigNumber(0)
            }

            return nftEntity.priceInAcudos.shiftedBy(-CURRENCY_DECIMALS)
        }

        return this.convertUsdInCudos(nftEntity.priceUsd);
    }

    formatPriceInCudosForNft(nftEntity: NftEntity): string {
        return `${this.getNftCudosPriceForNft(nftEntity).toFixed(2)} CUDOS`;
    }

    formatPriceInUsdForNft(nftEntity: NftEntity): string {
        const price = nftEntity.priceUsd === S.NOT_EXISTS ? 0 : nftEntity.priceUsd;
        return `$ ${new BigNumber(price).toFixed(2)}`;
    }

    formatExistingPriceForNft(nftEntity: NftEntity): string {
        if (nftEntity.isMinted() === true) {
            return this.formatPriceInCudosForNft(nftEntity);
        }

        return this.formatPriceInUsdForNft(nftEntity);
    }

    static formatAcudosInCudos(acudosPrice: BigNumber): string {
        return `${CudosStore.convertAcudosInCudos(acudosPrice).toString(10)} CUDOS`;
    }

    static formatAcudosInCudosWithPrecision(acudosPrice: BigNumber, decimals: number): string {
        return `${CudosStore.convertAcudosInCudos(acudosPrice).toFixed(decimals)} CUDOS`;
    }
}
