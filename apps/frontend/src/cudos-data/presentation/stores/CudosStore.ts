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
        return cudosAmount.multipliedBy(this.cudosDataEntity?.priceInEth ?? 0);
    }

    convertAcudosToEth(acudosPrice: BigNumber): BigNumber {
        return acudosPrice.shiftedBy(-CURRENCY_DECIMALS).multipliedBy(this.cudosDataEntity?.priceInEth ?? 0);
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
        return ProjectUtils.CUDOS_CURRENCY_DIVIDER.multipliedBy(dollars).dividedBy(this.cudosDataEntity?.priceInUsd ?? 1);
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

    formatAcudosInUsd(acudosPrice: BigNumber): string {
        return numeral(this.convertAcudosInUsdAsString(acudosPrice)).format(ProjectUtils.NUMERAL_USD);
    }

    formatCudosInUsd(cudosPrice: BigNumber): string {
        return numeral(this.convertCudosInUsd(cudosPrice).toString(10)).format(ProjectUtils.NUMERAL_USD);
    }

    static formatAcudosInCudos(acudosPrice: BigNumber): string {
        return `${CudosStore.convertAcudosInCudos(acudosPrice).toString(10)} CUDOS`;
    }

    static formatAcudosInCudosWithPrecision(acudosPrice: BigNumber, decimals: number): string {
        return `${CudosStore.convertAcudosInCudos(acudosPrice).toFixed(decimals)} CUDOS`;
    }

    getNftEthPriceForNft(nftEntity: NftEntity): BigNumber {
        if (nftEntity === null) {
            return new BigNumber(0);
        }

        let priceInAcudos
        if (nftEntity.isMinted() === false) {
            priceInAcudos = this.convertUsdInAcudos(nftEntity.priceUsd !== S.NOT_EXISTS ? nftEntity.priceUsd : 0);
        } else {
            priceInAcudos = nftEntity.priceInAcudos ?? new BigNumber(0);
        }

        return this.convertAcudosToEth(priceInAcudos);
    }

    getNftCudosPriceForNft(nftEntity: NftEntity): BigNumber {
        if (!nftEntity) {
            return new BigNumber(0);
        }

        if (nftEntity.isMinted() === true) {
            const priceInAcudos = nftEntity.priceInAcudos ?? new BigNumber(0);
            return CudosStore.convertAcudosInCudos(priceInAcudos);
        }

        return this.convertUsdInCudos(nftEntity.priceUsd);
    }

    getNftUsdPrice(nftEntity: NftEntity): number {
        if (nftEntity.isMinted() === false) {
            return nftEntity.priceUsd;
        }

        return nftEntity.priceInAcudos === null ? 0 : Number(this.convertAcudosInUsd(nftEntity.priceInAcudos).toFixed(2));
    }

    formatPriceInCudosForNft(nftEntity: NftEntity): string {
        const price = this.getNftCudosPriceForNft(nftEntity);
        return `${price.toFixed(2)} CUDOS`;
    }

    formatPriceInUsdForNft(nftEntity: NftEntity): string {
        // const price = !nftEntity || nftEntity.priceUsd === S.NOT_EXISTS ? 0 : nftEntity.priceUsd;
        // return `$ ${new BigNumber(price).toFixed(2)}`;
        const price = this.getNftUsdPrice(nftEntity);
        return numeral(price.toString()).format(ProjectUtils.NUMERAL_USD);
    }

    // formatExistingPriceForNft(nftEntity: NftEntity): string {
    //     if (nftEntity.isMinted() === true) {
    //         return this.formatPriceInCudosForNft(nftEntity);
    //     }

    //     return this.formatPriceInUsdForNft(nftEntity);
    // }
}
