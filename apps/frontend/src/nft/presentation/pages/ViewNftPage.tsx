import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router-dom';
import BigNumber from 'bignumber.js';

import ProjectUtils from '../../../core/utilities/ProjectUtils';
import ViewNftPageStore from '../stores/ViewNftPageStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import BuyNftModalStore from '../stores/BuyNftModalStore';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import ResellNftModalStore from '../stores/ResellNftModalStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import NftEntity from '../../entities/NftEntity';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import VisitorStore from '../../../visitor/presentation/stores/VisitorStore';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';

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

import SvgCudos from '../../../public/assets/vectors/cudos-logo.svg';
import '../styles/page-view-nft.css';

type Props = {
    accountSessionStore?: AccountSessionStore;
    walletStore?: WalletStore;
    bitcoinStore?: BitcoinStore;
    viewNftPageStore?: ViewNftPageStore;
    buyNftModalStore?: BuyNftModalStore;
    resellNftModalStore?: ResellNftModalStore;
    visitorStore?: VisitorStore;
    alertStore?: AlertStore;
}

function ViewNftPage({ accountSessionStore, walletStore, bitcoinStore, viewNftPageStore, buyNftModalStore, resellNftModalStore, visitorStore, alertStore }: Props) {

    const { nftId } = useParams();
    const navigate = useNavigate();

    const nftEntity = viewNftPageStore.nftEntity;
    const collectionEntity = viewNftPageStore.collectionEntity;
    const creatorAdminEntity = viewNftPageStore.adminEntity;

    useEffect(() => {
        async function run() {
            await viewNftPageStore.init(nftId);
            if (nftId !== undefined) {
                visitorStore.signalVisitNft(viewNftPageStore.nftEntity); // no need to wait for it
            }
        }

        run();
    }, []);

    function onClickNavigateMarketplace() {
        navigate(AppRoutes.MARKETPLACE);
    }

    function onClickCalculateRewards() {
        navigate(AppRoutes.REWARDS_CALCULATOR)
    }

    function onClickBuyNft() {
        if (accountSessionStore.shouldUserRegisterBtcAddress() === true) {
            alertStore.positiveLabel = 'Register';
            alertStore.positiveListener = () => {
                navigate(AppRoutes.USER_PROFILE);
            };
            alertStore.msg = 'You must register BTC payout adress first';
            alertStore.visible = true;
            return;
        }

        const balance = walletStore.getBalanceSafe().multipliedBy((new BigNumber(10).pow(18)));
        if (balance.lt(nftEntity.priceInAcudos)) {
            alertStore.show('Your balance is not enough to buy this.');
            return;
        }

        buyNftModalStore.showSignal(nftEntity, viewNftPageStore.cudosPrice, collectionEntity);
    }

    function onClickResellNft() {
        resellNftModalStore.showSignal(nftEntity, viewNftPageStore.cudosPrice, collectionEntity);
    }

    function getGeneralDataPreviews() {
        const generalDatapreviews = [];

        generalDatapreviews.push(createDataPreview('Listing Status', nftEntity.isStatusListed() === true ? 'Active' : 'Not Listed'));
        generalDatapreviews.push(createDataPreview('Mining Farm', nftEntity.name));
        generalDatapreviews.push(createDataPreview('Collection', collectionEntity.name));
        generalDatapreviews.push(createDataPreview('Expiry', nftEntity.formatExpiryDate()));

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
        profitDatapreviews.push(createDataPreview(
            'Estimated Profit per Week',
            <div className={'DataValue FlexRow'}>
                { viewNftPageStore.formatNetProfitPerWeek() }
                <div className={'SubPrice'}>{bitcoinStore.formatBtcInUsd(viewNftPageStore.calculateNetProfitPerWeek())}</div>
            </div>,
        ));
        profitDatapreviews.push(createDataPreview('Estimated Profit per Month', viewNftPageStore.formatNetProfitPerMonth()));
        profitDatapreviews.push(createDataPreview('Estimated Profit per Year', viewNftPageStore.formatNetProfitPerYear()));
        // profitDatapreviews.push(createDataPreview('Maintenance fee', nftEntity.formatMaintenanceFeeInBtc()));

        return profitDatapreviews;
    }

    function getPriceDataPreviews() {
        const priceDatapreviews = [];

        priceDatapreviews.push(createDataPreview('Blockchain', CHAIN_DETAILS.CHAIN_NAME));
        priceDatapreviews.push(createDataPreview(
            'Price',
            <div className={'DataValue NftPrice FlexRow'}>
                <Svg svg={SvgCudos}/>
                <div className={'H3 Bold'}>{nftEntity.formatPriceInCudos()}</div>
                <div className={'SubPrice B2 SemiBold'}>{viewNftPageStore.getNftPriceText()}</div>
            </div>,
        ));

        if (nftEntity.isMinted() === false) {
            priceDatapreviews.push(createDataPreview(
                'Mint Fee',
                <div className={'DataValue NftPrice FlexRow'}>
                    <Svg svg={SvgCudos}/>
                    <div className={'H3 Bold'}>1 CUDOS</div>
                    <div className={'SubPrice B2 SemiBold'}>${
                        viewNftPageStore.cudosStore.convertCudosInUsd(new BigNumber(1)).toFixed(4)
                    }</div>
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

            { (nftEntity === null || collectionEntity === null) && (
                <LoadingIndicator />
            ) }

            { nftEntity !== null && collectionEntity !== null && (
                <div className={'PageContent AppContent'} >

                    <Breadcrumbs crumbs={ [
                        createBreadcrumb('Marketplace', onClickNavigateMarketplace),
                        createBreadcrumb('NFT Details'),
                    ] }/>

                    <div className={'NftInfoCnt Grid GridColumns2'}>

                        <div className={'LeftLayout FlexColumn'}>
                            <div className={'PaddingColumn FlexColumn'}>
                                <div className={'NftImg'} style={ ProjectUtils.makeBgImgStyle(nftEntity.imageUrl) } />
                                <DataPreviewLayout
                                    dataPreviews={getGeneralDataPreviews()}
                                    gap={DataRowsGap.GAP_25}
                                    styledContainerProps = { {
                                        containerBackground: ContainerBackground.GRAY,
                                    } } />
                            </div>
                            <div className={'H2 Bold'}>Description</div>
                            <div className={'Description B1'}>{collectionEntity.description}</div>
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
                                        <div className={'Address ColorPrimary060'}>{ creatorAdminEntity ? ProjectUtils.shortenAddressString(creatorAdminEntity.cudosWalletAddress, 25) : ''}</div>
                                    </div>
                                </div>
                                <div className={'FlexRow OwnerBox'}>
                                    <div className={'OwnerPicture'}></div>
                                    <div className={'OwnerInfo FlexColumn'}>
                                        <div className={'AddressName B1 SemiBold'}>Current Owner</div>
                                        <div className={'Address ColorPrimary060'}>{ProjectUtils.shortenAddressString(nftEntity.currentOwner, 25)}</div>
                                    </div>
                                </div>
                            </div>
                            <DataPreviewLayout dataPreviews={getProfitDataPreviews()}/>
                            <div className={'FlexRow CalculateRewardsNav'}>
                                <div className={'B3'}>You can calculate your rewards in our dynamic Calculator</div>
                                <Actions height={ActionsHeight.HEIGHT_32}>
                                    <Button onClick={onClickCalculateRewards}>Calculate Rewards</Button>
                                </Actions>
                            </div>
                            <DataPreviewLayout dataPreviews={getPriceDataPreviews()} >
                                { accountSessionStore.isUserAndWalletConnected() && (
                                    <>
                                        { nftEntity.isStatusListed() === true && nftEntity.isOwnedByAddress(walletStore.getAddress()) === false && (
                                            <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                                                <Button onClick={onClickBuyNft}>Buy now for {nftEntity.formatPricePlusMintFeeInCudos()} </Button>
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

                                    </>
                                ) }
                            </DataPreviewLayout>
                        </div>
                    </div>

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
                </div>
            )}

            <PageFooter />
        </PageLayout>

    )

}

export default inject((stores) => stores)(observer(ViewNftPage));
