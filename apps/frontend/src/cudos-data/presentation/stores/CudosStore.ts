import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import { CURRENCY_DECIMALS } from 'cudosjs';
import ProjectUtils, { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import NftEntity from '../../../nft/entities/NftEntity';
import CudosDataEntity from '../../entities/CudosDataEntity';
import CudosRepo from '../repos/CudosRepo';
import S from '../../../core/utilities/Main';
import { formatCudos, formatPercent, formatUsd } from '../../../core/utilities/NumberFormatter';

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

    getCudosPriceInEth(): BigNumber {
        return this.cudosDataEntity?.priceInEth ?? new BigNumber(0);
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
        return cudosAmount.multipliedBy(this.getCudosPriceInEth());
    }

    convertAcudosToEth(acudosPrice: BigNumber): BigNumber {
        return CudosStore.convertAcudosInCudos(acudosPrice).multipliedBy(this.getCudosPriceInEth());
    }

    convertAcudosInUsd(acudosPrice: BigNumber): BigNumber {
        return CudosStore.convertAcudosInCudos(acudosPrice).multipliedBy(this.getCudosPriceInUsd());
    }

    convertCudosInUsd(cudosPrice: BigNumber): BigNumber {
        return cudosPrice.multipliedBy(this.getCudosPriceInUsd());
    }

    convertAcudosInUsdAsString(acudosPrice: BigNumber): string {
        return this.convertAcudosInUsd(acudosPrice).toFixed(4);
    }

    convertUsdInAcudos(dollars: number): BigNumber {
        const priceInUsd = this.getCudosPriceInUsd();
        if (priceInUsd === 0) {
            return new BigNumber(0);
        }

        return new BigNumber(dollars).dividedBy(priceInUsd).shiftedBy(CURRENCY_DECIMALS);
    }

    convertUsdInCudos(dollars: number): BigNumber {
        return dollars === S.NOT_EXISTS ? new BigNumber(0) : this.convertUsdInAcudos(dollars).shiftedBy(-CURRENCY_DECIMALS);
    }

    static convertAcudosInCudos(acudosPrice: BigNumber): BigNumber {
        return acudosPrice.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER);
    }

    formatCudosPriceChangeInPercentage(): string {
        return formatPercent(this.getCudosPriceChangeInPercentage(), true);
    }

    formatAcudosInUsd(acudosPrice: BigNumber): string {
        return formatUsd(this.convertAcudosInUsd(acudosPrice).toNumber());
    }

    formatCudosInUsd(cudosPrice: BigNumber): string {
        return formatUsd(this.convertCudosInUsd(cudosPrice).toNumber());
    }

    static formatAcudosInCudos(acudosPrice: BigNumber): string {
        return formatCudos(CudosStore.convertAcudosInCudos(acudosPrice), true);
    }

    static formatAcudosInCudosWithPrecision(acudosPrice: BigNumber, decimals: number): string {
        return formatCudos(CudosStore.convertAcudosInCudos(acudosPrice), true, decimals);
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

    getNftCudosPriceForNftPlusOnDemandMintFeeIfNeeded(nftEntity: NftEntity): BigNumber {
        let nftPriceInCudos = this.getNftCudosPriceForNft(nftEntity);

        if (nftEntity.isMinted() === false) {
            nftPriceInCudos = nftPriceInCudos.plus(ProjectUtils.ON_DEMAND_MINTING_SERVICE_FEE_IN_CUDOS);
        }

        return nftPriceInCudos;
    }

    getNftUsdPrice(nftEntity: NftEntity): number {
        if (nftEntity.isMinted() === false) {
            return nftEntity.priceUsd !== S.NOT_EXISTS ? nftEntity.priceUsd : 0;
        }

        return nftEntity.priceInAcudos === null ? 0 : Number(this.convertAcudosInUsd(nftEntity.priceInAcudos).toFixed(2));
    }

    getNftUsdPricePlusOnDemandMintFeeIfNeeded(nftEntity: NftEntity): number {
        if (nftEntity.isMinted() === false) {
            if (nftEntity.priceUsd !== S.NOT_EXISTS) {
                const onDemandMintingFeeInUsd = this.convertCudosInUsd(ProjectUtils.ON_DEMAND_MINTING_SERVICE_FEE_IN_CUDOS);
                return nftEntity.priceUsd + onDemandMintingFeeInUsd.toNumber();
            }
            return 0;
        }

        return nftEntity.priceInAcudos === null ? 0 : Number(this.convertAcudosInUsd(nftEntity.priceInAcudos).toFixed(2));
    }

    formatPriceInCudosForNft(nftEntity: NftEntity): string {
        const price = this.getNftCudosPriceForNft(nftEntity);
        const prefix = nftEntity.isMinted() === true ? '' : '~';
        return `${prefix}${formatCudos(price, true)}`;
    }

    formatPriceInCudosForNftPlusOnDemandMintFeeIfNeeded(nftEntity: NftEntity): string {
        const price = this.getNftCudosPriceForNftPlusOnDemandMintFeeIfNeeded(nftEntity);
        const prefix = nftEntity.isMinted() === true ? '' : '~';

        return `${prefix}${formatCudos(price, true)}`;
    }

    formatPriceInUsdForNft(nftEntity: NftEntity): string {
        const price = this.getNftUsdPrice(nftEntity);
        return formatUsd(price);
    }

    formatPriceInUsdForNftPlusOnDemandMintFeeIfNeeded(nftEntity: NftEntity): string {
        const price = this.getNftUsdPricePlusOnDemandMintFeeIfNeeded(nftEntity);
        return formatUsd(price);
    }

    // formatExistingPriceForNft(nftEntity: NftEntity): string {
    //     if (nftEntity.isMinted() === true) {
    //         return this.formatPriceInCudosForNft(nftEntity);
    //     }

    //     return this.formatPriceInUsdForNft(nftEntity);
    // }
}
