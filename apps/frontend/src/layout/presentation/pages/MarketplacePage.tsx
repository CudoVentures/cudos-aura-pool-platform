import React, { useEffect, useState } from 'react';
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
import StyledContainer, { ContainerBorder, ContainerPadding } from '../../../core/presentation/components/StyledContainer';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';
import Progressbar from '../../../core/presentation/components/StaticProgressBar';
import PictureGallery from '../../../core/presentation/components/PictureGallery';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import { runInAction } from 'mobx';
import PresaleStore from '../../../app-routes/presentation/PresaleStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import AlertStore from '../../../core/presentation/stores/AlertStore';

type Props = {
    alertStore?: AlertStore
    accountSessionStore?: AccountSessionStore
    walletStore?: WalletStore
    marketplacePageStore?: MarketplacePageStore
    presaleStore?: PresaleStore
}

function MarkedplacePage({ alertStore, accountSessionStore, marketplacePageStore, walletStore, presaleStore }: Props) {
    const {
        presaleCollectionEntity,
    } = marketplacePageStore;

    useEffect(() => {
        const interval = setInterval(() => {
            runInAction(() => {
                presaleStore.update();
            })
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        marketplacePageStore.fetchAllowlistUser();
    }, [walletStore.address]);

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

    function checkBtcAddressRegistered(): boolean {
        if (accountSessionStore.shouldUserRegisterBtcAddress() === true) {
            alertStore.positiveLabel = 'Register';
            alertStore.positiveListener = () => {
                navigate(AppRoutes.USER_PROFILE);
            };
            alertStore.msg = 'You must register BTC payout adress first';
            alertStore.visible = true;
            return false;
        }

        return true;
    }

    async function onClickBuyWithCudos() {
        if (checkBtcAddressRegistered() === false) {
            return;
        }

        const success = await marketplacePageStore.onClickBuyWithCudos();
        if (success === true) {
            showSuccessAlert();
        }
    }

    async function onClickBuyWithEth() {
        if (checkBtcAddressRegistered() === false) {
            return;
        }

        const success = await marketplacePageStore.onClickBuyWithEth();
        if (success === true) {
            showSuccessAlert();
        }
    }

    function showSuccessAlert() {
        alertStore.msg = 'You have successfully bought the NFTs. It should appear it your Profile page shortly. In case of an error you will be able to widthdraw your funds from Profile page as well.';
        alertStore.positiveLabel = 'Profile';
        alertStore.positiveListener = () => {
            navigate(AppRoutes.USER_PROFILE);
        };
        alertStore.negativeLabel = 'Ok'
        alertStore.visible = true;
    }

    useEffect(() => {
        async function run() {
            await marketplacePageStore.init();
        }
        run();
    }, []);

    const presaleTimesLeft = marketplacePageStore.getPresaleTimeLeft();

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
                        {marketplacePageStore.isPresaleOver() === true
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
                {marketplacePageStore.isPresaleOver() === true && (<>
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
                {marketplacePageStore.isPresaleOver() === false && (
                    <RowLayout className={ 'PresaleContainer' } numColumns={2} gap={100}>
                        <ColumnLayout className={ 'PresaleInfoColumn' } gap={24}>
                            <div className={ 'Primary60 B2 SemiBold' }>PRESALE COLLECTION</div>
                            <div className={ 'ColorNeutral100 B1 Bold'}>{presaleCollectionEntity?.name ?? ''}</div>
                            <div className={ 'B2 SemiBold' }>{presaleCollectionEntity?.description ?? ''}</div>
                            <ColumnLayout className={ 'PresaleInfoColumn' } gap={8}>
                                <StyledContainer
                                    className={ 'PhaseInfoContainer' }
                                    containerPadding={ContainerPadding.PADDING_16}
                                    containerBorder={ContainerBorder.PRIMARY_60}>
                                    <ColumnLayout className={ 'PhaseInfoColumn' } gap={8}>
                                        <RowLayout className={ 'PhaseHeader' } numColumns={2}>
                                            <div className={'PhaseName B3 SemiBold'}>Presale Phase</div>
                                            <div className={ 'FlexRow PhaseEta B2 SemiBold' }>
                                                <div className={'ColorNeutral050'}>Ends in:</div>
                                                <div className={'TimeNumberBox FlexRow'}>{presaleTimesLeft.presaleDaysLeft}</div>
                                                <div className={'TimeNumberBox FlexRow'}>{presaleTimesLeft.presaleHoursLeft}</div>
                                                <div className={'TimeNumberBox FlexRow'}>{presaleTimesLeft.presaleMinutesLeft}</div>
                                                <div className={'TimeNumberBox FlexRow'}>{presaleTimesLeft.presaleSecondsleft}</div>
                                            </div>
                                        </RowLayout>
                                        <div className={ 'PhasePriceRow FlexRow' }>
                                            <div className={ 'PriceInfo FlexRow' }>
                                                <div className={'B2 SemiBold ColorNeutral050'}>Price:</div>
                                                <div className={ 'PriceWithIcon FlexRow' }>
                                                    <Svg svg={SvgCudosLogo} size={SvgSize.CUSTOM}/>
                                                    <div className={'B2 SemiBold ColorNeutral100'}>{marketplacePageStore.getPresalePriceCudosFormatted()}</div>
                                                </div>
                                                <div className={ 'PriceWithIcon FlexRow' }>
                                                    <Svg svg={SvgEthereumLogo} size={SvgSize.CUSTOM}/>
                                                    <div className={'B2 SemiBold ColorNeutral100'}>{marketplacePageStore.getPresalePriceEthFormatted()}</div>
                                                    <div className={'B3 SemiBold ColorNeutral040'}>({marketplacePageStore.getPresalePriceUsdFormatted()})</div>
                                                </div>
                                            </div>
                                            <div className={ 'WhitelistedInfo B2 SemiBold ColorNeutral060' }>Whitelisted: <span className={'ColorNeutral100'}>{marketplacePageStore.getWhitelistedAmount()}</span></div>
                                        </div>
                                        <Progressbar fillPercent={marketplacePageStore.getPresaleMintedPercent()} />
                                        <div className={ 'AmountMintedRow FlexRow' }>
                                            <div className={'B3 ColorNeutral60'}>Minted so far</div>
                                            <div className={'B3 ColorNeutral60'}>{marketplacePageStore.getPresaleMintedPercent().toFixed(2)}% ({marketplacePageStore.getPresaleMintedAmount()}/{marketplacePageStore.getPresaleTotalAmount()})</div>
                                        </div>
                                    </ColumnLayout>
                                </StyledContainer>
                                <StyledContainer
                                    className={ 'PhaseInfoContainer' }
                                    containerPadding={ContainerPadding.PADDING_16} >
                                    <ColumnLayout className={ 'PhaseInfoColumn' }>
                                        <RowLayout className={ 'PhaseHeader' } numColumns={2}>
                                            <div className={'PhaseName B3 SemiBold'}>Public Stage</div>
                                            <div className={ 'B2 SemiBold PhaseEta FlexRow' }>
                                                <div className={'ColorNeutral050'}>Starts in:</div>
                                                <div className={'TimeNumberBox FlexRow'}>{presaleTimesLeft.presaleDaysLeft}</div>
                                                <div className={'TimeNumberBox FlexRow'}>{presaleTimesLeft.presaleHoursLeft}</div>
                                                <div className={'TimeNumberBox FlexRow'}>{presaleTimesLeft.presaleMinutesLeft}</div>
                                                <div className={'TimeNumberBox FlexRow'}>{presaleTimesLeft.presaleSecondsleft}</div>
                                            </div>
                                        </RowLayout>
                                        <div className={'B2 ColorNeutral050'}>Once the Public Phase starts the Aura Pool Platform will be open for everyone. This will allow whitelisted users to put their minted NFTs for resale.</div>
                                    </ColumnLayout>
                                </StyledContainer>
                            </ColumnLayout>
                            {walletStore.isConnected() === false && (
                                <div className = { 'FlexSingleCenter ColorError060 Bold' } >
                                    Connect your wallet to buy
                                </div>
                            )}
                            {marketplacePageStore.isUserEligibleToBuy() === true && (
                                <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_ROW_ENDS}>
                                    <Button padding={ButtonPadding.PADDING_48} onClick={onClickBuyWithCudos}>Buy now for {marketplacePageStore.getPresalePriceCudosFormatted()}</Button>
                                    <Button padding={ButtonPadding.PADDING_48} onClick={onClickBuyWithEth}>Buy now for {marketplacePageStore.getPresalePriceEthFormatted()}</Button>
                                </Actions>
                            )}
                        </ColumnLayout>

                        <PictureGallery
                            className={'PresaleNftPictureGallery'}
                            picture={marketplacePageStore.getPresaleNftPicture()}
                            onClickNext={marketplacePageStore.onClickNextPresaleNftPicture}
                            onClickPrevious={marketplacePageStore.onClickPreviousPresaleNftPicture}
                        />
                    </RowLayout>
                )}
            </div>
            <PageFooter />
        </PageLayout>
    )
}

export default inject((stores) => stores)(observer(MarkedplacePage));
