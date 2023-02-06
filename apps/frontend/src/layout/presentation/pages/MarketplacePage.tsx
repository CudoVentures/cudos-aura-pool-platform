import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import AppRoutes from '../../../app-routes/entities/AppRoutes';
import MarketplacePageStore from '../stores/MarketplacePageStore';
import NftEntity from '../../../nft/entities/NftEntity';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';

import PageLayout from '../../../core/presentation/components/PageLayout';
import Button, { ButtonPadding, ButtonType } from '../../../core/presentation/components/Button';
import Actions, { ActionsHeight, ActionsLayout } from '../../../core/presentation/components/Actions';
import TopCollections from '../../../collection/presentation/components/TopCollections';
import PageHeader from '../../../layout/presentation/components/PageHeader';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import Slider from '../../../core/presentation/components/Slider';
import NftPreviewInPicture from '../../../nft/presentation/components/NftPreviewInPicture';
import NftPreview from '../../../nft/presentation/components/NftPreview';
import MiningFarmPreview from '../../../mining-farm/presentation/components/MiningFarmPreview';
import DefaultIntervalPicker from '../../../analytics/presentation/components/DefaultIntervalPicker';
import SvgCudosLogo from '../../../public/assets/vectors/cudos-logo.svg';
import SvgEthereumLogo from '../../../public/assets/vectors/ethereum-logo.svg';

import '../styles/page-marketplace.css';
import RowLayout from '../../../core/presentation/components/RowLayout';
import ColumnLayout from '../../../core/presentation/components/ColumnLayout';
import StyledContainer, { ContainerPadding } from '../../../core/presentation/components/StyledContainer';
import Svg from '../../../core/presentation/components/Svg';
import Progressbar from '../../../core/presentation/components/StaticProgressBar';

type Props = {
    marketplacePageStore?: MarketplacePageStore
}

function MarkedplacePage({ marketplacePageStore }: Props) {
    const {
        presaleCollectionEntity,
        presaleCollectionDetailsEntity,
        isPresaleOver,
        getPresaleTimeLeft,
        getPresaleTotalAmount,
        getPresaleMintedAmount,
        getPresaleMintedPercent,
        getWhitelistedAmount,
        getPresalePriceCudosFormatted,
        getPresalePriceEthFormatted,
        getPresalePriceUsdFormatted,
        onClickBuyWithCudos,
        onClickBuyWithEth,
    } = marketplacePageStore;

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

    function onClickExploreMarketplace() {
        window.location.hash = '#marketplace-heading';
    }

    useEffect(() => {
        async function run() {
            await marketplacePageStore.init();
        }
        run();
    }, []);

    const presaleTimesLeft = getPresaleTimeLeft();

    return (
        <PageLayout className = { 'PageMarketplace' } >
            <PageHeader />
            <div className={'PageContent AppContent'} >

                <div className = { 'MarketplaceHero' } >
                    <div className = { 'MarketplaceHeroInfo' } >
                        <div className = { 'MarketplaceHeroInfoHeadingLine1 ExtraBold' } >Mine BTC</div>
                        <div className = { 'MarketplaceHeroInfoHeadingLine2 ExtraBold' } >Sustainably</div>
                        <div className = { 'H3 MarketplaceHeroInfoDesc' } >Enabling mining power access to the next million miners</div>
                        <div className = { 'MarketplaceHeroInfoCons FlexRow' } >
                            <label>Daily payments</label>
                            <label>Mine on real bitcoin</label>
                            <label>Simple process</label>
                        </div>
                        {isPresaleOver() === true
                            && (<Actions>
                                <Button onClick = { onClickExploreMarketplace }>Explore Marketplace</Button>
                            </Actions>)}
                    </div>
                    <div className = { 'MarketplaceHeroBg' }>
                        <div className = { 'HeroCircle HeroCircle03' } />
                        <img className = { 'HeroImg02' } src={'/assets/img/marketplace-hero-02.png'} />
                        <div className = { 'HeroCircle HeroCircle01' } />
                        <div className = { 'HeroCircle HeroCircle02' } />
                        <img className = { 'HeroImg01' } src={'/assets/img/marketplace-hero-01.png'} />
                    </div>
                </div>
                {isPresaleOver() === true && (<>
                    <div id = 'marketplace-heading' className={'MarketplaceHeading'}>
                        <div className={'H2 ExtraBold ColorNeutral100'}>Explore Trending NFTs</div>
                        <div className={'B1 ColorNeutral060'}>Farms, collections, and NFTs that accumulate value.</div>
                    </div>

                    <div className = { 'SectionWrapper' } >
                        <div className={'H2 ExtraBold SectionHeadingCnt'}>Trending NFTs</div>
                        { marketplacePageStore.trendingNftEntities.length === 0 ? (
                            <div className={'NoContent B1 SemiBold'}>There are currently no trending NFTs</div>
                        ) : (
                            <Slider>
                                {marketplacePageStore.trendingNftEntities.map((nftEntity: NftEntity, index: number) => {
                                    return (
                                        <NftPreview
                                            key={index}
                                            nftEntity={nftEntity}
                                            collectionName={marketplacePageStore.getCollectionName(nftEntity.collectionId)} />
                                    )
                                })}
                            </Slider>
                        ) }
                        <Actions
                            className = { 'SectionActions' }
                            layout={ActionsLayout.LAYOUT_ROW_CENTER}
                            height={ActionsHeight.HEIGHT_48} >
                            <Button
                                padding={ButtonPadding.PADDING_24}
                                type={ButtonType.ROUNDED}
                                onClick={onClickSeeAllNfts} >
                            See All NFTs
                            </Button>
                        </Actions>
                    </div>

                    <div className = { 'SectionWrapper SectionHashRateDrops' } >
                        <div className = { 'HashRateDropsInfo FlexColumn' } >
                            <div className = { 'H2 ExtraBold' } >New Hash Rate NFT Drops</div>
                            <div className = { 'B1' } >Powered by AuraPool Protocol</div>
                            <Actions className = { 'HashRateDropsInfoActions' } layout = { ActionsLayout.LAYOUT_COLUMN_FULL } >
                                <Button onClick = { onClickSeeAllNfts }>Explore NFTs</Button>
                            </Actions>
                        </div>

                        <div className = { 'HashRateDropsCnt' }>
                            { marketplacePageStore.newNftDropsEntities.length === 0 ? (
                                <div className={'NoContent B1 SemiBold'}>There are currently no new NFT Drops</div>
                            ) : (
                                <Slider itemsPerPage = { 3 } showDots = { false } navWithTransparency = { false } >
                                    { marketplacePageStore.newNftDropsEntities.map((nftEntity: NftEntity, index: number) => {
                                        return (
                                            <NftPreviewInPicture
                                                key={index}
                                                nftEntity={nftEntity}
                                                collectionEntity={marketplacePageStore.getCollectionById(nftEntity.collectionId)} />
                                        )
                                    }) }
                                </Slider>
                            ) }
                        </div>
                    </div>

                    <div className = { 'SectionWrapper' } >
                        <div className = { 'SectionHeadingCnt' } >
                            <div className={'H2 ExtraBold'}>Top Collections</div>
                            <div className = { 'CenterCnt FlexSingleCenter' } >
                                <DefaultIntervalPicker defaultIntervalPickerState={marketplacePageStore.defaultIntervalPickerState} />
                            </div>
                        </div>
                        <TopCollections
                            topCollectionEntities={marketplacePageStore.topCollectionEntities}
                            collectionDetailsMap={marketplacePageStore.collectionDetailsMap} />
                        <Actions
                            className = { 'SectionActions' }
                            layout={ActionsLayout.LAYOUT_ROW_CENTER}
                            height={ActionsHeight.HEIGHT_48}>
                            <Button
                                onClick={onClickSeeAllCollections}
                                padding={ButtonPadding.PADDING_24}>
                            See All Collections
                            </Button>
                        </Actions>
                    </div>

                    <div className={'SectionWrapper'}>
                        <div className={'SectionHeadingCnt H2 ExtraBold'}>Popular Farms</div>
                        { marketplacePageStore.popularFarmsEntities.length === 0 ? (
                            <div className={'NoContent B1 SemiBold'}>There are currently no Popular Farms</div>
                        ) : (
                            <Slider itemsPerPage = { 3 } extendPaddingForShadow = { true } >
                                { marketplacePageStore.popularFarmsEntities.map((miningFarmEntity: MiningFarmEntity, index: number) => {
                                    return (
                                        <MiningFarmPreview
                                            key={index}
                                            miningFarmEntity={miningFarmEntity}
                                            miningFarmDetailsEntity = { marketplacePageStore.getMiningFarmDetailsEntity(miningFarmEntity.id) } />
                                    )
                                }) }
                            </Slider>
                        ) }
                        <Actions
                            className = { 'SectionActions' }
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
                </>)}
                {isPresaleOver() === true && (
                    <RowLayout className={ 'PresaleContainer' } numColumns={2}>
                        <ColumnLayout className={ 'PresaleInfoColumn' } gap={24}>
                            <div className={ 'Primary60 B2 SemiBold' }>PRESALE COLLECTION</div>
                            <div className={ 'ColorNeutral100 B1 Bold'}>{presaleCollectionEntity?.name ?? ''}</div>
                            <div className={ 'B2 SemiBold' }>{presaleCollectionEntity?.description ?? ''}</div>
                            <ColumnLayout className={ 'PresaleInfoColumn' } gap={8}>
                                <StyledContainer
                                    className={ 'PhaseInfoContainer' }
                                    containerPadding={ContainerPadding.PADDING_16}
                                    containerShadow={true}
                                >
                                    <ColumnLayout className={ 'PhaseInfoColumn' } gap={8}>
                                        <RowLayout className={ 'PhaseHeader' } numColumns={2}>
                                            <div className={'PhaseName'}>Presale Phase</div>
                                            <RowLayout className={ 'PhaseEta' } numColumns={5} gap={4}>
                                                <div className={'B2 SemiBold ColorNeutral50'}>Ends in:</div>
                                                <div className={'TimeNumberBox'}>{presaleTimesLeft.presaleDaysLeft}</div>
                                                <div className={'TimeNumberBox'}>{presaleTimesLeft.presaleHoursLeft}</div>
                                                <div className={'TimeNumberBox'}>{presaleTimesLeft.presaleMinutesLeft}</div>
                                                <div className={'TimeNumberBox'}>{presaleTimesLeft.presaleSecondsleft}</div>
                                            </RowLayout>
                                        </RowLayout>
                                        <RowLayout className={ 'PhasePriceRow' } numColumns={2}>
                                            <RowLayout className={ 'PriceInfo' } numColumns={3} gap={6}>
                                                <div className={'B2 SemiBold ColorNeutral50'}>Ends in:</div>
                                                <RowLayout className={ 'PriceWithIcon' } numColumns={2} gap={4}>
                                                    <Svg svg={SvgCudosLogo}/>
                                                    <div className={'B2 SemiBold ColorNeutral100'}>{getPresalePriceCudosFormatted()}</div>
                                                </RowLayout>
                                                <RowLayout className={ 'PriceWithIcon' } numColumns={3} gap={4}>
                                                    <Svg svg={SvgEthereumLogo}/>
                                                    <div className={'B2 SemiBold ColorNeutral100'}>{getPresalePriceEthFormatted}</div>
                                                    <div className={'B3 SemiBold ColorNeutral40'}>({getPresalePriceUsdFormatted()})</div>
                                                </RowLayout>
                                            </RowLayout>
                                            <div className={ 'WhitelistedInfo B2 SemiBold ColorNeutral60' }>Whitelisted: <span className={'ColorNeutral100'}>{getWhitelistedAmount()}</span></div>
                                        </RowLayout>
                                        <Progressbar fillPercent={getPresaleMintedPercent()} />
                                        <RowLayout className={ 'AmountMintedRow' } numColumns={2}>
                                            <div className={'B3 ColorNeutral60'}>Minted so far</div>
                                            <div className={'B3 ColorNeutral60'}>{getPresaleMintedPercent()}% ({getPresaleMintedAmount()}/{getPresaleTotalAmount()})</div>
                                        </RowLayout>
                                    </ColumnLayout>
                                </StyledContainer>
                                <StyledContainer
                                    className={ 'PhaseInfoContainer' }
                                    containerPadding={ContainerPadding.PADDING_16}
                                    containerShadow={true}
                                >
                                    <ColumnLayout className={ 'PhaseInfoColumn' }>
                                        <RowLayout className={ 'PhaseHeader' } numColumns={2}>
                                            <div className={'PhaseName'}>Public Stage</div>
                                            <RowLayout className={ 'PhaseEta' } numColumns={5} gap={4}>
                                                <div className={'B2 SemiBold ColorNeutral50'}>Starts in:</div>
                                                <div className={'TimeNumberBox'}>{presaleTimesLeft.presaleDaysLeft}</div>
                                                <div className={'TimeNumberBox'}>{presaleTimesLeft.presaleHoursLeft}</div>
                                                <div className={'TimeNumberBox'}>{presaleTimesLeft.presaleMinutesLeft}</div>
                                                <div className={'TimeNumberBox'}>{presaleTimesLeft.presaleSecondsleft}</div>
                                            </RowLayout>
                                        </RowLayout>
                                        <div className={'B2 ColorNeutral50'}>Once the Public Phase starts the Aura Pool Platform will be open for everyone. This will allow whitelisted users to put their minted NFTs for resale.</div>
                                    </ColumnLayout>
                                </StyledContainer>
                            </ColumnLayout>
                            <Actions height={ActionsHeight.HEIGHT_48}>
                                <Button onCLick={onClickBuyWithCudos}>Buy now for {getPresalePriceCudosFormatted()}</Button>
                                <Button onCLick={onClickBuyWithEth}>Buy now for {getPresalePriceEthFormatted()}</Button>
                            </Actions>
                        </ColumnLayout>

                        <PictureGallery
                            className={'PresaleNftPictureGallery'}
                            pictures={getPresaleNftPictures()}
                            onClickNext={onClickNextPresaleNftPicture}
                            onClickPrevious={onClickPreviousPresaleNftPicture}
                        />
                    </RowLayout>
                )}
            </div>
            <PageFooter />
        </PageLayout>
    )
}

export default inject((stores) => stores)(observer(MarkedplacePage));
