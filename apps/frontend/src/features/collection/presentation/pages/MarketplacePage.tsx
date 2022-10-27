import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import S from '../../../../core/utilities/Main';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import MarketplaceStore from '../stores/MarketplaceStore';
import NftEntity from '../../../nft/entities/NftEntity';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';

import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment } from '@mui/material';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import Input, { InputType } from '../../../../core/presentation/components/Input';
import Button, { ButtonPadding, ButtonType } from '../../../../core/presentation/components/Button';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import TopCollections from '../components/TopCollections';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import Slider from '../../../../core/presentation/components/Slider';
import NftPreviewInPicture from '../../../nft/presentation/components/NftPreviewInPicture';
import NftPreview from '../../../nft/presentation/components/NftPreview';
import MiningFarmPreview from '../../../mining-farm/presentation/components/MiningFarmPreview';

import Svg from '../../../../core/presentation/components/Svg';
import '../styles/page-marketplace.css';

type Props = {
    marketplaceStore?: MarketplaceStore
}

function MarkedplacePage({ marketplaceStore }: Props) {

    const navigate = useNavigate();

    function onClickSeeAllNfts() {
        navigate(AppRoutes.EXPLORE_NFTS);
    }

    function onClickSeeAllCollections() {
        navigate(AppRoutes.EXPLORE_COLLECTIONS);
    }

    function onClickSeeAllFarms() {
        navigate(AppRoutes.EXPLORE_MINING_FARMS);
    }

    useEffect(() => {
        async function run() {
            await marketplaceStore.init();
        }
        run();
    }, []);

    return (
        <PageLayoutComponent className = { 'PageMarketplace' } >
            <PageHeader />
            <div className={'PageContent AppContent'} >
                <div className={'ExploreCollections FlexColumn'}>
                    <div className={'PageHeading H1 Bold'}>Explore NFT Collections</div>
                    <div className={'Grid GridColumns3'}>
                        <div></div>
                        <Input
                            inputType={InputType.TEXT}
                            className={'SearchBar'}
                            value = { marketplaceStore.searchString }
                            onChange = { marketplaceStore.changeSearchString }
                            placeholder = {'Search Collections, Farms and accounts'}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" >
                                    <Svg svg={SearchIcon}/>
                                </InputAdornment>,
                            }} />
                        <div></div>
                    </div>
                    {/* <div className={'CategoriesRow FlexRow'}>
                        { marketplaceStore.categories.map((category, index) => {
                            return (
                                <div
                                    key={category.categoryId}
                                    onClick={() => marketplaceStore.selectCategory(index)}
                                    className={`CategoryName Transition Clickable ${S.CSS.getActiveClassName(marketplaceStore.selectedCategoryIndex === index)}`} >
                                    {category.categoryName}
                                </div>
                            )
                        }) }
                    </div> */}
                </div>
                <div className={'H2 Bold'}>New Hash Rate NFT Drops</div>
                <Slider className={'NewNftDrops'}>
                    {marketplaceStore.newNftDropsEntities.length === 0 && (<div className={'NoContent B1 SemiBold'}>There are currently no new NFT Drops</div>)}
                    {marketplaceStore.newNftDropsEntities.slice(0, 4).map((nftEntity: NftEntity, index: number) => <NftPreviewInPicture
                        key={index}
                        nftEntity={nftEntity}
                        onClick={() => navigate(`${AppRoutes.VIEW_NFT}/${nftEntity.id}`)}
                        collectionEntity={marketplaceStore.getCollectionById(nftEntity.collectionId)}
                    />)}
                </Slider>
                <div className={'H2 Bold'}>Trending NFTs</div>
                <Slider className={'TrendingNfts'}>
                    {marketplaceStore.trendingNftEntities.length === 0 && (<div className={'NoContent B1 SemiBold'}>There are currently no trending NFTs</div>)}
                    {marketplaceStore.trendingNftEntities.slice(0, 4).map((nftEntity: NftEntity, index: number) => <NftPreview
                        key={index}
                        nftEntity={nftEntity}
                        onClick={() => navigate(`${AppRoutes.VIEW_NFT}/${nftEntity.id}`)}
                        collectionEntity={marketplaceStore.getCollectionById(nftEntity.collectionId)}
                    />)}
                </Slider>
                <Actions
                    layout={ActionsLayout.LAYOUT_ROW_CENTER}
                    height={ActionsHeight.HEIGHT_48} >
                    {/* TODO: redirect */}
                    <Button
                        padding={ButtonPadding.PADDING_24}
                        type={ButtonType.ROUNDED}
                        onClick={onClickSeeAllNfts} >
                        See All NFTs
                    </Button>
                </Actions>
                <TopCollections
                    selectedTopCollectionPeriod={marketplaceStore.selectedTopCollectionPeriod}
                    cudosPriceChangeDisplay={marketplaceStore.cudosPriceChangeDisplay()}
                    cudosPriceUsd={marketplaceStore.cudosPrice}
                    topCollectionEntities={marketplaceStore.topCollectionEntities}
                    changeTopCollectionPeriod={marketplaceStore.changeTopCollectionPeriod} />
                <Actions
                    layout={ActionsLayout.LAYOUT_ROW_CENTER}
                    height={ActionsHeight.HEIGHT_48}>
                    <Button
                        onClick={onClickSeeAllCollections}
                        padding={ButtonPadding.PADDING_24}
                        type={ButtonType.ROUNDED}>
                        See All Collections
                    </Button>
                </Actions>

                <div className={'PopularFarms FlexColumn'}>
                    <div className={'H2 Bold'}>Popular Farms</div>
                    <Slider className={'TrendingNfts'} maxItems={3}>
                        {marketplaceStore.popularFarmsEntities.length === 0 && (<div className={'NoContent B1 SemiBold'}>There are currently no Popular Farms</div>)}
                        {marketplaceStore.popularFarmsEntities.slice(0, 3).map((miningFarmEntity: MiningFarmEntity, index: number) => <MiningFarmPreview
                            key={index}
                            miningFarmEntity={miningFarmEntity}
                        />)}
                    </Slider>
                    <Actions
                        layout={ActionsLayout.LAYOUT_ROW_CENTER}
                        height={ActionsHeight.HEIGHT_48}>
                        <Button
                            onClick={onClickSeeAllFarms}
                            padding={ButtonPadding.PADDING_24}
                            type={ButtonType.ROUNDED}>
                        See All Farms
                        </Button>
                    </Actions>
                </div>
            </div>
            <PageFooter />
        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(MarkedplacePage));
