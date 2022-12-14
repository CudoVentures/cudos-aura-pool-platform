import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router-dom';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import ViewNftPageStore from '../stores/ViewNftPageStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import BuyNftModalStore from '../stores/BuyNftModalStore';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import ResellNftModalStore from '../stores/ResellNftModalStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import NftEntity from '../../entities/NftEntity';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';

import Breadcrumbs, { createBreadcrumb } from '../../../../core/presentation/components/Breadcrumbs';
import NftStats from '../components/NftStats';
import Button from '../../../../core/presentation/components/Button';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import Svg from '../../../../core/presentation/components/Svg';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import BuyNftModal from '../components/BuyNftModal';
import ResellNftModal from '../components/ResellNftModal';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';
import NftPreview from '../components/NftPreview';
import GridView from '../../../../core/presentation/components/GridView';
import DataPreviewLayout, { createDataPreview, DataRowsGap } from '../../../../core/presentation/components/DataPreviewLayout';
import { ContainerBackground } from '../../../../core/presentation/components/StyledContainer';

import SvgCudos from '../../../../public/assets/vectors/cudos-logo.svg';
import '../styles/page-view-nft.css';
import VisitorStore from '../../../visitor/presentation/stores/VisitorStore';

type Props = {
    walletStore?: WalletStore;
    bitcoinStore?: BitcoinStore;
    viewNftPageStore?: ViewNftPageStore;
    buyNftModalStore?: BuyNftModalStore;
    resellNftModalStore?: ResellNftModalStore;
    visitorStore?: VisitorStore;
}

function ViewNftPage({ walletStore, bitcoinStore, viewNftPageStore, buyNftModalStore, resellNftModalStore, visitorStore }: Props) {

    const { nftId } = useParams();
    const navigate = useNavigate();

    const nftEntity = viewNftPageStore.nftEntity;
    const collectionEntity = viewNftPageStore.collectionEntity;

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
        buyNftModalStore.showSignal(nftEntity, viewNftPageStore.cudosPrice, collectionEntity.name);
    }

    function onClickResellNft() {
        resellNftModalStore.showSignal(nftEntity, viewNftPageStore.cudosPrice, collectionEntity.name);
    }

    function getGeneralDataPreviews() {
        const generalDatapreviews = [];

        generalDatapreviews.push(createDataPreview('Listing Status', nftEntity.isStatusListed() === true ? 'Active' : 'Not Listed'));
        generalDatapreviews.push(createDataPreview('Sining Farm', nftEntity.name));
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

        return priceDatapreviews;
    }

    return (
        <PageLayoutComponent
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
                        createBreadcrumb('NFT Name Details'),
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
                                        <div className={'Address'}>{ProjectUtils.shortenAddressString(nftEntity.creatorAddress, 25)}</div>
                                    </div>
                                </div>
                                <div className={'FlexRow OwnerBox'}>
                                    <div className={'OwnerPicture'}></div>
                                    <div className={'OwnerInfo FlexColumn'}>
                                        <div className={'AddressName B1 SemiBold'}>Current Owner</div>
                                        <div className={'Address'}>{ProjectUtils.shortenAddressString(nftEntity.currentOwnerAddress, 25)}</div>
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
                                { walletStore.isConnected() && (
                                    <>
                                        { nftEntity.isStatusListed() === true ? (
                                            <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                                                <Button onClick={onClickBuyNft}>Buy now for {nftEntity.formatPriceInCudos()} </Button>
                                            </Actions>
                                        ) : (
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
        </PageLayoutComponent>

    )

}

export default inject((stores) => stores)(observer(ViewNftPage));
