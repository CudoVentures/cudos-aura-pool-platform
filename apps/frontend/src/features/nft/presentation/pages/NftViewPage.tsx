import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router-dom';

import S from '../../../../core/utilities/Main';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import ViewNftPageStore from '../stores/ViewNftPageStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import BuyNftModalStore from '../stores/BuyNftModalStore';
import ResellNftModalStore from '../stores/ResellNftModalStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import NftEntity from '../../entities/NftEntity';

import Breadcrumbs from '../../../../core/presentation/components/Breadcrumbs';
import NftViewHistory from '../components/NftViewHistory';
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

import SvgCudos from '../../../../core/presentation/vectors/cudos-logo.svg';
import '../styles/page-nft-view-component.css';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import DataPreviewLayout, { createDataPreview, DataRowsGap } from '../../../../core/presentation/components/DataPreviewLayout';
import { ContainerBackground } from '../../../../core/presentation/components/StyledContainer';

type Props = {
    walletStore?: WalletStore;
    viewNftPageStore?: ViewNftPageStore;
    buyNftModalStore?: BuyNftModalStore;
    resellNftModalStore?: ResellNftModalStore;
}

function NftViewPage({ walletStore, viewNftPageStore, buyNftModalStore, resellNftModalStore }: Props) {

    const { nftId } = useParams();
    const navigate = useNavigate();

    const nftEntity = viewNftPageStore.nftEntity;
    const collectionEntity = viewNftPageStore.collectionEntity;

    // TODO: get crumbs from router
    const crumbs = [
        { name: 'Marketplace', onClick: () => { navigate(AppRoutes.MARKETPLACE) } },
        { name: 'NFT Name Details', onClick: () => {} },
    ]

    useEffect(() => {
        async function run() {
            await viewNftPageStore.init(nftId);
        }

        run();
    }, []);

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

        generalDatapreviews.push(createDataPreview('Listing Status', nftEntity.listingStatus === S.INT_TRUE ? 'Active' : 'Not Listed'));
        generalDatapreviews.push(createDataPreview('Sining Farm', nftEntity.name));
        generalDatapreviews.push(createDataPreview('Collection', collectionEntity.name));
        generalDatapreviews.push(createDataPreview('Expiry', nftEntity.getExpiryDisplay()));

        return generalDatapreviews;
    }

    function getProfitDataPreviews() {
        const profitDatapreviews = [];

        profitDatapreviews.push(createDataPreview('Hashing Power', nftEntity.getHashPowerDisplay()));
        profitDatapreviews.push(createDataPreview(
            'Estimated Profit per Day',
            <div className={'DataValue FlexRow'}>
                0.002 BTC
                <div className={'SubPrice'}>${(0.002 * viewNftPageStore.bitcoinPrice).toFixed(2)}</div>
            </div>,
        ));
        profitDatapreviews.push(createDataPreview(
            'Estimated Profit per Week',
            <div className={'DataValue FlexRow'}>
                0.014 BTC
                <div className={'SubPrice'}>${(0.014 * viewNftPageStore.bitcoinPrice).toFixed(2)}</div>
            </div>,
        ));
        profitDatapreviews.push(createDataPreview('Estimated Profit per Month', '2K'));
        profitDatapreviews.push(createDataPreview('Estimated Profit per Year', '735'));

        return profitDatapreviews;
    }

    function getPriceDataPreviews() {
        const priceDatapreviews = [];

        priceDatapreviews.push(createDataPreview('Blockchain', CHAIN_DETAILS.CHAIN_NAME[walletStore.selectedNetwork]));
        priceDatapreviews.push(createDataPreview(
            'Price',
            <div className={'DataValue NftPrice FlexRow'}>
                <Svg svg={SvgCudos}/>
                <div className={'H3 Bold'}>{nftEntity.price.toFixed(0)} CUDOS</div>
                <div className={'SubPrice B2 SemiBold'}>{viewNftPageStore.getNftPriceText()}</div>
            </div>,
        ));

        return priceDatapreviews;
    }

    return (
        <PageLayoutComponent
            className = { 'PageNftView' }
            modals = {
                <>
                    <BuyNftModal />
                    <ResellNftModal />
                </>
            } >
            <PageHeader />

            { nftEntity === null && (
                <LoadingIndicator />
            ) }

            { nftEntity !== null && (
                <div className={'PageContent AppContent'} >
                    <Breadcrumbs crumbs={crumbs}/>
                    <div className={'NftInfoCnt Grid GridColumns2'}>
                        <div className={'LeftLayout FlexColumn'}>
                            <div className={'PaddingColumn FlexColumn'}>
                                <div className={'Picture'}
                                    style={{
                                        backgroundImage: `url("${nftEntity.imageUrl}")`,
                                    }} />
                                <DataPreviewLayout
                                    dataPreviews={getGeneralDataPreviews()}
                                    gap={DataRowsGap.GAP_25}
                                    containerBackground={ContainerBackground.GRAY}
                                />
                            </div>
                            <div className={'H2 Bold'}>Description</div>
                            <div className={'Description B1'}>{collectionEntity.description}</div>
                            <NftViewHistory />
                        </div>
                        <div className={'RightLayout FlexColumn'}>
                            <div className={'CollectionName B2 SemiBolBuy now for {nftEntity.price.toFixed(0)} CUDOSd'}>{collectionEntity.name}</div>
                            <div className={'H2 Bold NftName'}>{nftEntity.name}</div>
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
                                <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_ROW_RIGHT}>
                                    <Button onClick={onClickCalculateRewards}>Calculate Rewards</Button>
                                </Actions>
                            </div>
                            <DataPreviewLayout
                                dataPreviews={getPriceDataPreviews()}
                            >
                                { walletStore.isConnected() && (
                                    <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                                        { viewNftPageStore.isNftListed() === true && (
                                            <Button onClick={onClickBuyNft}>Buy now for {nftEntity.price.toFixed(0)} CUDOS </Button>
                                        ) }
                                        { viewNftPageStore.isNftListed() === false && viewNftPageStore.isOwner(walletStore.getAddress()) && (
                                            <Button onClick={onClickResellNft}>Resell NFT</Button>
                                        ) }
                                    </Actions>
                                ) }
                            </DataPreviewLayout>
                        </div>
                    </div>
                    <div className={'HorizontalSeparator'}/>
                    <div className={'H2 Bold'}>Collection Items</div>
                    <DataGridLayout
                        header = { null } >

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

export default inject((stores) => stores)(observer(NftViewPage));
