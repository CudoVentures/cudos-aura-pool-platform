import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router-dom';

import ProjectUtils from '../../../core/utilities/ProjectUtils';
import ViewNftPageStore from '../stores/ViewNftPageStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import BuyNftModalStore from '../stores/BuyNftModalStore';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import ResellNftModalStore, { ModalType } from '../stores/ResellNftModalStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import NftEntity from '../../entities/NftEntity';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import VisitorStore from '../../../visitor/presentation/stores/VisitorStore';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import KycStore from '../../../kyc/presentation/stores/KycStore';
import PresaleStore from '../../../app-routes/presentation/PresaleStore';

import Breadcrumbs, { createBreadcrumb } from '../../../core/presentation/components/Breadcrumbs';
import NftStats from '../components/NftStats';
import Button from '../../../core/presentation/components/Button';
import Actions, { ActionsHeight, ActionsLayout } from '../../../core/presentation/components/Actions';
import PageLayout from '../../../core/presentation/components/PageLayout';
import Svg from '../../../core/presentation/components/Svg';
import PageHeader from '../../../layout/presentation/components/PageHeader';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import BuyNftModal from '../components/BuyNftModal';
import ResellNftModal from '../components/ResellNftModal';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import DataGridLayout from '../../../core/presentation/components/DataGridLayout';
import NftPreview from '../components/NftPreview';
import GridView from '../../../core/presentation/components/GridView';
import DataPreviewLayout, { createDataPreview, DataRowsGap } from '../../../core/presentation/components/DataPreviewLayout';
import { ContainerBackground } from '../../../core/presentation/components/StyledContainer';
import TextWithTooltip from '../../../core/presentation/components/TextWithTooltip';
import NewLine from '../../../core/presentation/components/NewLine';

import SvgCudos from '../../../public/assets/vectors/cudos-logo.svg';
import '../styles/page-view-nft.css';
import { FAQ } from '../../../core/utilities/Links';

type Props = {
    accountSessionStore?: AccountSessionStore;
    walletStore?: WalletStore;
    bitcoinStore?: BitcoinStore;
    viewNftPageStore?: ViewNftPageStore;
    buyNftModalStore?: BuyNftModalStore;
    resellNftModalStore?: ResellNftModalStore;
    visitorStore?: VisitorStore;
    alertStore?: AlertStore;
    kycStore?: KycStore;
    presaleStore?: PresaleStore
}

function ViewNftPage({ accountSessionStore, walletStore, bitcoinStore, viewNftPageStore, buyNftModalStore, resellNftModalStore, visitorStore, alertStore, kycStore, presaleStore }: Props) {

    const { nftId } = useParams();
    const navigate = useNavigate();
    const [hasAccess, setHasAccess] = useState(false);

    const cudosStore = viewNftPageStore.cudosStore;
    const nftEntity = viewNftPageStore.nftEntity;
    const collectionEntity = viewNftPageStore.collectionEntity;
    const miningFarmEntity = viewNftPageStore.miningFarmEntity;
    const creatorAdminEntity = viewNftPageStore.adminEntity;

    useEffect(() => {
        async function run() {
            await viewNftPageStore.init(nftId);
            if (viewNftPageStore.hasAccess() === false) {
                navigate(AppRoutes.HOME);
                return;
            }
            setHasAccess(true);
            if (nftId !== undefined) {
                visitorStore.signalVisitNft(viewNftPageStore.nftEntity); // no need to wait for it
            }
        }

        setHasAccess(false);
        run();
    }, [nftId]);

    function onClickFarmLink() {
        navigate(ProjectUtils.makeUrlMiningFarm(viewNftPageStore.collectionEntity.farmId));
    }

    function onClickCollectionLink() {
        navigate(ProjectUtils.makeUrlCollection(viewNftPageStore.collectionEntity.id));
    }

    function onClickNavigateMarketplace() {
        navigate(AppRoutes.MARKETPLACE);
    }

    function onClickExploreNfts() {
        navigate(AppRoutes.EXPLORE_NFTS)
    }

    // function onClickCalculateRewards() {
    //     navigate({
    //         pathname: AppRoutes.REWARDS_CALCULATOR,
    //         search: `?farmId=${miningFarmEntity.id}&hashPower=${nftEntity.hashPowerInTh}`,
    //     })
    // }

    async function onClickBuyNft() {
        const balance = walletStore.getBalanceSafe();
        if (balance.lt(cudosStore.getNftCudosPriceForNftPlusOnDemandMintFeeIfNeeded(nftEntity))) {
            alertStore.show('You don’t have enough funds to purchase this NFT.');
            return;
        }

        // if (await accountSessionStore.shouldUserRegisterBtcAddress() === true) {
        //     alertStore.positiveLabel = 'Register';
        //     alertStore.positiveListener = () => {
        //         navigate(AppRoutes.USER_PROFILE);
        //     };
        //     alertStore.msg = 'You must register a BTC payout address first';
        //     alertStore.negativeLabel = 'Cancel';
        //     alertStore.visible = true;
        //     return;
        // }

        const nftUsdPrice = cudosStore.getNftUsdPricePlusOnDemandMintFeeIfNeeded(nftEntity);
        if (kycStore.canBuyAnNft(nftUsdPrice) === false) {
            alertStore.msg = 'You account is not verified or it is partially verified';
            alertStore.positiveLabel = 'Verify';
            alertStore.positiveListener = () => {
                navigate(AppRoutes.KYC);
            };
            alertStore.negativeLabel = 'Cancel';
            alertStore.visible = true;
            return;
        }

        buyNftModalStore.showSignal(nftEntity, viewNftPageStore.cudosPrice, collectionEntity);
    }

    function onClickResellNft() {
        resellNftModalStore.showSignal(ModalType.RESELL, nftEntity, viewNftPageStore.cudosPrice, collectionEntity, miningFarmEntity);
    }

    function onClickEditListing() {
        resellNftModalStore.showSignal(ModalType.EDIT_RESELL, nftEntity, viewNftPageStore.cudosPrice, collectionEntity, miningFarmEntity);
    }

    function getGeneralDataPreviews() {
        const generalDatapreviews = [];

        generalDatapreviews.push(createDataPreview('Listing Status', nftEntity.isStatusListed() === true ? 'Active' : 'Not Listed'));
        generalDatapreviews.push(createDataPreview('Mining Farm', <span className = {presaleStore.isInPresale() ? '' : 'Clickable' } onClick = { presaleStore.isInPresale() ? null : onClickFarmLink }>{miningFarmEntity.name}</span>));
        generalDatapreviews.push(createDataPreview('Collection', <span className = { presaleStore.isInPresale() ? '' : 'Clickable' } onClick = { presaleStore.isInPresale() ? null : onClickCollectionLink }>{collectionEntity.name}</span>));
        generalDatapreviews.push(createDataPreview('Expiry', nftEntity.formatExpiryDate()));
        generalDatapreviews.push(createDataPreview('Secondary NFT Sale Platform Fee', collectionEntity.formatRoyaltiesInPercentage()));
        generalDatapreviews.push(createDataPreview('CUDOS Markets Secondary Resale Royalty', miningFarmEntity.formatResaleNftRoyaltiesPercent()));

        return generalDatapreviews;
    }

    function getProfitDataPreviews() {
        const profitDatapreviews = [];

        profitDatapreviews.push(createDataPreview('Hashing Power', nftEntity.formatHashPowerInTh()));
        profitDatapreviews.push(createDataPreview(
            'Estimated Profit per Day',
            <div className={'DataValue FlexRow'}>
                { viewNftPageStore.formatNetProfitPerDay() }
                <div className={'SubPrice'}>{bitcoinStore.formatBtcInUsd(viewNftPageStore.calculateNetProfitPerDay())}</div>
            </div>,
        ));
        // profitDatapreviews.push(createDataPreview(
        //     'Estimated Profit per Week',
        //     <div className={'DataValue FlexRow'}>
        //         { viewNftPageStore.formatNetProfitPerWeek() }
        //         <div className={'SubPrice'}>{bitcoinStore.formatBtcInUsd(viewNftPageStore.calculateNetProfitPerWeek())}</div>
        //     </div>,
        // ));
        // profitDatapreviews.push(createDataPreview('Estimated Profit per Month', viewNftPageStore.formatNetProfitPerMonth()));
        // profitDatapreviews.push(createDataPreview('Estimated Profit per Year', viewNftPageStore.formatNetProfitPerYear()));
        profitDatapreviews.push(createDataPreview(<TextWithTooltip text = { 'Maintenance Fee' } tooltipText = { 'This NFT\'s part of Farm\'s Maintenance fee. The fee is monthly.' } />, viewNftPageStore.formatMontlyMaintenanceFee()));

        return profitDatapreviews;
    }

    function getPriceDataPreviews() {
        const priceDatapreviews = [];

        priceDatapreviews.push(createDataPreview('Blockchain', CHAIN_DETAILS.CHAIN_NAME));
        priceDatapreviews.push(createDataPreview(
            'Price',
            <div className={'DataValue NftPrice FlexRow'}>
                <Svg svg={SvgCudos}/>
                <div className={'H3 Bold'}>{cudosStore.formatPriceInCudosForNft(nftEntity)}</div>
                <div className={'SubPrice B2 SemiBold'}>{viewNftPageStore.formatNftPriceInUsd()}</div>
            </div>,
        ));

        if (nftEntity.isStatusListed() === true && nftEntity.isMinted() === false) {
            priceDatapreviews.push(createDataPreview(
                'Fee',
                <div className={'DataValue NftPrice FlexRow'}>
                    <Svg svg={SvgCudos}/>
                    <div className={'H3 Bold'}>{ProjectUtils.ON_DEMAND_MINTING_SERVICE_FEE_IN_CUDOS.toFixed(0)} CUDOS</div>
                    <div className={'SubPrice B2 SemiBold'}>{cudosStore.formatCudosInUsd(ProjectUtils.ON_DEMAND_MINTING_SERVICE_FEE_IN_CUDOS)}</div>
                </div>,
            ));
        }
        return priceDatapreviews;
    }

    return (
        <PageLayout
            className = { 'PageViewNft' }
            modals = {
                <>
                    <BuyNftModal />
                    <ResellNftModal />
                </>
            } >
            <PageHeader />

            { (nftEntity === null || collectionEntity === null || hasAccess === false) ? (
                <LoadingIndicator />
            ) : (
                <div className={'PageContent AppContent'} >

                    <Breadcrumbs crumbs={ [
                        createBreadcrumb('Marketplace', presaleStore.isInPresale() === true ? onClickNavigateMarketplace : onClickExploreNfts),
                        createBreadcrumb('NFT Details'),
                    ] }/>

                    <div className={'NftInfoCnt Grid GridColumns2'}>

                        <div className={'LeftLayout FlexColumn'}>
                            <div className={'PaddingColumn FlexColumn'}>
                                <div className={'NftImg'} style={ ProjectUtils.makeBgImgStyle(nftEntity.imageUrl) } />
                                <DataPreviewLayout
                                    dataPreviews={getGeneralDataPreviews()}
                                    gap={DataRowsGap.GAP_10}
                                    styledContainerProps = { {
                                        containerBackground: ContainerBackground.WHITE,
                                    } } />
                            </div>
                            <div className={'H2 Bold'}>Description</div>
                            <div className={'Description B1'}><NewLine text = {collectionEntity.description} /></div>
                            <NftStats viewNftPageStore = {viewNftPageStore}/>
                        </div>

                        <div className={'RightLayout FlexColumn'}>
                            <div className={'CollectionName SemiBold'}>{collectionEntity.name}</div>
                            <div className={'NftName H2 Bold'}>{nftEntity.name}</div>
                            <div className={'FlexRow OwnerRow'}>
                                <div className={'FlexRow OwnerBox'}>
                                    <div className={'OwnerPicture'}></div>
                                    <div className={'OwnerInfo FlexColumn'}>
                                        <div className={'AddressName B1 SemiBold'}>Creator</div>
                                        <a href={ProjectUtils.makeUrlExplorer(creatorAdminEntity ? creatorAdminEntity.cudosWalletAddress : '')} target = "_blank" rel = 'noreferrer' className={'Address ColorPrimary060'}>{ creatorAdminEntity ? ProjectUtils.shortenAddressString(creatorAdminEntity.cudosWalletAddress, 25) : ''}</a>
                                    </div>
                                </div>
                                {nftEntity.isMinted() === true && (
                                    <div className={'FlexRow OwnerBox'}>
                                        <div className={'OwnerPicture'}></div>
                                        <div className={'OwnerInfo FlexColumn'}>
                                            <div className={'AddressName B1 SemiBold'}>Current Owner</div>
                                            <a href={ProjectUtils.makeUrlExplorer(nftEntity.currentOwner)} target = "_blank" rel = 'noreferrer' className={'Address ColorPrimary060'}>{ProjectUtils.shortenAddressString(nftEntity.currentOwner, 25)}</a>
                                        </div>
                                    </div>)}
                            </div>
                            <DataPreviewLayout dataPreviews={getProfitDataPreviews()}/>
                            <div className={'FlexRow CalculateRewardsNav'}>
                                <div className={'B3'}>You can calculate your rewards in our dynamic Calculator</div>
                                <Actions height={ActionsHeight.HEIGHT_32}>
                                    {/* <Button onClick={onClickCalculateRewards}>Calculate Rewards</Button> */}
                                    <Button href={FAQ}>FAQs</Button>
                                </Actions>
                            </div>
                            { presaleStore.isInPresale() === false && (
                                <DataPreviewLayout dataPreviews={getPriceDataPreviews()} >
                                    { accountSessionStore.isUserAndWalletConnected() && (
                                        <>
                                            { nftEntity.isStatusListed() === true && nftEntity.isOwnedByAddress(walletStore.getAddress()) === false && (
                                                <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                                                    <Button onClick={onClickBuyNft}>{nftEntity.formatPurchaseTypeText()} now for {cudosStore.formatPriceInCudosForNftPlusOnDemandMintFeeIfNeeded(nftEntity)} </Button>
                                                </Actions>
                                            )}
                                            { nftEntity.isStatusListed() === false && nftEntity.isOwnedByAddress(walletStore.getAddress()) === true && (
                                                <>
                                                    { nftEntity.isOwnedByAddress(walletStore.getAddress()) && (
                                                        <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                                                            <Button onClick={onClickResellNft}>Resell NFT</Button>
                                                        </Actions>
                                                    ) }
                                                </>
                                            ) }
                                            { nftEntity.isStatusListed() === true && nftEntity.isOwnedByAddress(walletStore.getAddress()) === true && (
                                                <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                                                    <Button onClick={onClickEditListing}>Edit Listing</Button>
                                                </Actions>
                                            )}
                                        </>
                                    ) }
                                </DataPreviewLayout>
                            ) }
                        </div>
                    </div>

                    { presaleStore.isInPresale() === false && (
                        <>
                            <div className={'SectionDivider'}/>
                            <div className={'H2 Bold'}>Collection Items</div>
                            <DataGridLayout className = { 'NftsCnt' } >

                                { viewNftPageStore.nftEntities === null && (
                                    <LoadingIndicator />
                                ) }

                                { viewNftPageStore.nftEntities !== null && (
                                    <GridView
                                        gridViewState={viewNftPageStore.gridViewState}
                                        defaultContent={viewNftPageStore.nftEntities.length === 0 ? <div className={'NoContentFound'}>No Nfts found</div> : null}>
                                        { viewNftPageStore.nftEntities.map((nftEntityRef: NftEntity) => {
                                            return (
                                                <NftPreview
                                                    key={nftEntityRef.id}
                                                    nftEntity={nftEntityRef}
                                                    collectionName={collectionEntity.name} />
                                            )
                                        }) }
                                    </GridView>
                                ) }

                            </DataGridLayout>
                        </>
                    ) }

                </div>
            )}

            <PageFooter />
        </PageLayout>

    )

}

export default inject((stores) => stores)(observer(ViewNftPage));
