import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { Link, useNavigate } from 'react-router-dom';

import AppRoutes from '../../../app-routes/entities/AppRoutes';
import MarketplacePageStore from '../stores/MarketplacePageStore';
import NftEntity from '../../../nft/entities/NftEntity';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import WalletSelectModalStore from '../stores/WalletSelectModalStore';

import PageLayout from '../../../core/presentation/components/PageLayout';
import Button, { ButtonBorder, ButtonColor, ButtonPadding, ButtonType } from '../../../core/presentation/components/Button';
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
import SvgBlueDiamond from '../../../public/assets/vectors/blue-diamond.svg';
import SvgDiamond from '../../../public/assets/vectors/diamond.svg';
import SvgEmerald from '../../../public/assets/vectors/emerald.svg';
import SvgRuby from '../../../public/assets/vectors/ruby.svg';
import SvgOpal from '../../../public/assets/vectors/opal.svg';

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
import KycStore from '../../../kyc/presentation/stores/KycStore';
import NftPresaleStore from '../../../nft-presale/presentation/stores/NftPresaleStore';
import NewLine from '../../../core/presentation/components/NewLine';
import Checkbox from '../../../core/presentation/components/Checkbox';
import S from '../../../core/utilities/Main';
import { TERMS_AND_CONDITIONS } from '../../../core/utilities/Links';
import MarketPresaleNftPreview from '../components/MarketplacePresaleNftPreview';
import BuyPresaleNftModalStore from '../stores/BuyPresaleNftModalStore';
import BuyPresaleNftModal from '../components/BuyPresaleNftModal';
import { PRESALE_CONSTS } from '../../../core/utilities/Constants';
import ScrollDown from '../../../core/presentation/components/ScrollDown';

type Props = {
    nftPresaleStore?: NftPresaleStore
    alertStore?: AlertStore
    accountSessionStore?: AccountSessionStore
    walletStore?: WalletStore
    marketplacePageStore?: MarketplacePageStore
    presaleStore?: PresaleStore
    kycStore?: KycStore,
    buyPresaleNftModalStore?: BuyPresaleNftModalStore;
    walletSelectModalStore?: WalletSelectModalStore;
}

function MarkedplacePage({ nftPresaleStore, alertStore, accountSessionStore, marketplacePageStore, walletStore, presaleStore, kycStore, buyPresaleNftModalStore, walletSelectModalStore }: Props) {
    const { presaleCollectionEntity } = nftPresaleStore;

    const [acceptTermsAndConditions, setAcceptTermsAndConditions] = useState(S.INT_FALSE);
    const [fetchingKyc, setFetchingKyc] = useState(false);

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
        const run = async () => {
            setFetchingKyc(true);
            await nftPresaleStore.fetchAllowlistUser();
            setFetchingKyc(false);
        }

        run();
    }, [accountSessionStore.userEntity?.cudosWalletAddress]);

    useEffect(() => {
        nftPresaleStore.presaleStore.update();

        if (nftPresaleStore.isPresaleOver() === false) {
            nftPresaleStore.init();
        } else {
            marketplacePageStore.init();
        }
    }, []);

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

    function onClickKyc() {
        navigate(AppRoutes.KYC);
    }

    // async function checkBtcAddressRegistered(): Promise<boolean> {
    //     if (await accountSessionStore.shouldUserRegisterBtcAddress() === true) {
    //         alertStore.positiveLabel = 'Register';
    //         alertStore.positiveListener = () => {
    //             navigate(AppRoutes.USER_PROFILE);
    //         };
    //         alertStore.msg = 'You must register a BTC payout address first';
    //         alertStore.negativeLabel = 'Cancel';
    //         alertStore.visible = true;
    //         return false;
    //     }

    //     return true;
    // }

    function checkKyc(): boolean {
        if (kycStore.canBuyPresaleNft() === false) {
            alertStore.msg = 'You account is not verified or it is partially verified';
            alertStore.positiveLabel = 'Verify';
            alertStore.positiveListener = () => {
                navigate(AppRoutes.KYC);
            };
            alertStore.negativeLabel = 'Cancel';
            alertStore.visible = true;
            return false;
        }

        return true;
    }

    async function onClickBuyWithCudos() {
        // if (await checkBtcAddressRegistered() === false || checkKyc() === false) {
        if (checkKyc() === false) {
            return;
        }

        const success = await nftPresaleStore.onClickBuyWithCudos();
        if (success === true) {
            buyPresaleNftModalStore.show();
        }
    }

    async function onClickBuyWithEth() {
        // if (await checkBtcAddressRegistered() === false || checkKyc() === false) {
        if (checkKyc() === false) {
            return;
        }

        const success = await nftPresaleStore.onClickBuyWithEth();
        if (success === true) {
            buyPresaleNftModalStore.show();
        }
    }

    async function onClickConnectWallet() {
        await walletStore.tryConnect();
        if (walletStore.isConnected() === true) {
            if (accountSessionStore.doesAddressMatchAgainstSessionAccount(walletStore.getAddress()) === true) {
                return;
            }

            await walletStore.disconnect();
        }

        if (accountSessionStore.isSuperAdmin() === true) {
            walletSelectModalStore.showSignalAsSuperAdmin();
            return;
        }

        if (accountSessionStore.isAdmin() === true) {
            walletSelectModalStore.showSignalAsAdmin(null);
            return;
        }

        walletSelectModalStore.showSignalAsUser();
    }

    function arePresaleBuyButtonsForceDisabled() {
        return accountSessionStore.isLoggedInAndWalletConnected() === false || nftPresaleStore.isUserEligibleToBuy() === false || kycStore.canBuyPresaleNft() === false;
    }

    function renderPresaleBuyWithCudos() {
        const disabled = arePresaleBuyButtonsForceDisabled() || acceptTermsAndConditions !== S.INT_TRUE;

        return (
            <Actions height={ActionsHeight.HEIGHT_42} layout={ActionsLayout.LAYOUT_ROW_ENDS}>
                <Button padding={ButtonPadding.PADDING_24} onClick={onClickBuyWithCudos} disabled = { disabled } >Mint now for {nftPresaleStore.getPresalePriceCudosFormatted()} CUDOS</Button>
            </Actions>
        )
    }

    function renderPresaleBuyWithEth() {
        const disabled = arePresaleBuyButtonsForceDisabled() || acceptTermsAndConditions !== S.INT_TRUE;

        return (
            <Actions height={ActionsHeight.HEIGHT_42} layout={ActionsLayout.LAYOUT_ROW_ENDS}>
                <Button padding={ButtonPadding.PADDING_24} onClick={onClickBuyWithEth} disabled = { disabled }>Mint now for {nftPresaleStore.getPresalePriceEthFormatted()} ETH</Button>
            </Actions>
        )
    }

    function renderKycWarnings() {
        // that method is invoked only when kycStore.canBuyAnNft returns false;
        // it can return false in two cases - 1. making >$1000 and no full kyc; 2 -> everything else

        // case 1
        if (kycStore.willPassLightKycLimitWithPresaleNft() === true && kycStore.doesHasFullKyc() === false) {
            return (
                <span className = { 'PurchaseError Bold' }>Spending over $1k requires full KYC <span className = { 'ColorPrimary060 Clickable' } onClick = { onClickKyc }>verification</span>, so please head to the <span className = { 'ColorPrimary060 Clickable' } onClick = { onClickKyc }>verification</span>  page to submit your KYC data.</span>
            )
        }

        // case 2
        return (
            <span className = { 'PurchaseError Bold' }>Please complete the <span className = { 'ColorPrimary060 Clickable' } onClick = { onClickKyc }>verification</span> to mint. For under $1k no passport nor ID is needed. You only need to provide your first and last name, and we will look up your internet service provider address to determine your location.</span>
        )
    }

    return (
        <PageLayout
            className={'PageMarketplace'}
            modals = { <BuyPresaleNftModal /> } >
            <PageHeader />
            <div className={'PageContent AppContent'} >

                <div className={'MarketplaceHero'} >
                    <div className={'MarketplaceHeroInfo'} >
                        <div className={'MarketplaceHeroInfoHeadingLine1 ExtraBold'} >The World's first Marketplace for</div>
                        <div className={'MarketplaceHeroInfoHeadingLine2 ExtraBold'} >Hashrate<br />Collectibles</div>
                        <div className={'H3 MarketplaceHeroInfoDesc'} >Mine Bitcoin, effortlessly</div>
                        <div className={'MarketplaceHeroInfoCons FlexRow'} >
                            <label>Sustainable mining</label>
                            <label>Real bitcoin</label>
                            <label>No hardware needed</label>
                        </div>
                        {nftPresaleStore.isPresaleOver() === true && (
                            <Actions>
                                <Button onClick={onClickSeeAllNfts}>Explore Marketplace</Button>
                            </Actions>
                        )}
                    </div>
                    <div className={'MarketplaceHeroBg'}>
                        <div className={'HeroCircle HeroCircle03'} />
                        <img className={'HeroImg02'} src={'/assets/img/marketplace-hero-02.png?cache=1'} />
                        <div className={'HeroCircle HeroCircle01'} />
                        <div className={'HeroCircle HeroCircle02'} />
                        <img className={'HeroImg01'} src={'/assets/img/marketplace-hero-01.png?cache=1'} />
                    </div>
                </div>
                {nftPresaleStore.isPresaleOver() === true && (<>
                    <div className={'MarketplaceHeading '}>
                        <div className={'H2 ExtraBold ColorNeutral100'}>Explore Trending NFTs</div>
                    </div>

                    <div className={'SectionWrapper'} >
                        {marketplacePageStore.trendingNftEntities.length === 0 ? (
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
                        )}
                        <Actions
                            className={'SectionActions'}
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

                    <div className={'SectionWrapper SectionHashRateDrops'} >
                        <div className={'HashRateDropsInfo FlexColumn'} >
                            <div className={'H2 ExtraBold'} >New Hash Rate NFT Drops</div>
                            <div className={'B1'} >Powered by CUDOS Markets</div>
                            <Actions className={'HashRateDropsInfoActions'} layout={ActionsLayout.LAYOUT_COLUMN_FULL} >
                                <Button
                                    border={ButtonBorder.NO_BORDER}
                                    color={ButtonColor.SCHEME_4}
                                    onClick={onClickSeeAllNfts}>
                                    Explore NFTs
                                </Button>
                            </Actions>
                        </div>

                        <div className={'HashRateDropsCnt'}>
                            {marketplacePageStore.newNftDropsEntities.length === 0 ? (
                                <div className={'NoContent B1 SemiBold'}>There are currently no new NFT Drops</div>
                            ) : (
                                <Slider itemsPerPage={3} showDots={false} navWithTransparency={false} >
                                    {marketplacePageStore.newNftDropsEntities.map((nftEntity: NftEntity, index: number) => {
                                        return (
                                            <NftPreviewInPicture
                                                key={index}
                                                nftEntity={nftEntity}
                                                collectionEntity={marketplacePageStore.getCollectionById(nftEntity.collectionId)} />
                                        )
                                    })}
                                </Slider>
                            )}
                        </div>
                    </div>

                    {/* <div className={'SectionWrapper'} >
                        <div className={'SectionHeadingCnt'} >
                            <div className={'H2 ExtraBold'}>Top Collections</div>
                            <div className={'CenterCnt FlexSingleCenter'} >
                                <DefaultIntervalPicker defaultIntervalPickerState={marketplacePageStore.defaultIntervalPickerState} />
                            </div>
                        </div>
                        <TopCollections
                            topCollectionEntities={marketplacePageStore.topCollectionEntities}
                            collectionDetailsMap={marketplacePageStore.collectionDetailsMap} />
                        <Actions
                            className={'SectionActions'}
                            layout={ActionsLayout.LAYOUT_ROW_CENTER}
                            height={ActionsHeight.HEIGHT_48}>
                            <Button
                                onClick={onClickSeeAllCollections}
                                padding={ButtonPadding.PADDING_24}>
                                See All Collections
                            </Button>
                        </Actions>
                    </div> */}

                    <div className={'SectionWrapper'}>
                        <div className={'SectionHeadingCnt H2 ExtraBold'}>Popular Farms</div>
                        {marketplacePageStore.popularFarmsEntities.length === 0 ? (
                            <div className={'NoContent B1 SemiBold'}>There are currently no Popular Farms</div>
                        ) : (
                            <Slider itemsPerPage={3} extendPaddingForShadow={true} >
                                {marketplacePageStore.popularFarmsEntities.map((miningFarmEntity: MiningFarmEntity, index: number) => {
                                    return (
                                        <MiningFarmPreview
                                            key={index}
                                            miningFarmEntity={miningFarmEntity}
                                            miningFarmDetailsEntity={marketplacePageStore.getMiningFarmDetailsEntity(miningFarmEntity.id)} />
                                    )
                                })}
                            </Slider>
                        )}
                        <Actions
                            className={'SectionActions'}
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
                {nftPresaleStore.isPresaleOver() === false && (
                    <ColumnLayout className={'PresaleInfoColumn'} gap={8}>
                        <div className = { 'PresaleInfo Bold ColorPrimary060' } >Win up to 170TH/s worth of renewable energy NFTs! You are guaranteed one of the five NFTs you can see below, or you could get one of the exclusive 1/1 if you are super lucky! Happy minting!</div>
                        {/* <div className={'Primary60 B2 SemiBold CollectionLabel'}>
                            { PRESALE_CONSTS.RESPECT_ALLOWLIST ? 'Presale collection' : 'Public sale collection' }
                        </div> */}
                        <div className={'ColorNeutral100 H2 CollectionName'}>{presaleCollectionEntity?.name ?? ''}</div>
                        <div className={'ColorNeutral100 B2 CollectionDescription'}><NewLine text = {presaleCollectionEntity?.description ?? ''} /></div>
                        <StyledContainer
                            className={'PhaseInfoContainer FlexColumn'}
                            containerPadding={ContainerPadding.PADDING_32}>

                            <ColumnLayout className={'PhaseInfoColumn'} gap={32}>
                                <div className={'PriceInfo FlexRow'}>
                                    <div className={'B2 SemiBold ColorNeutral050'}>Price:</div>
                                    <div className={'PriceWithIcon FlexRow'}>
                                        <Svg svg={SvgCudosLogo} size={SvgSize.CUSTOM} />
                                        <div className={'PriceItself Bold ColorNeutral100'}>{nftPresaleStore.getPresalePriceCudosFormatted()}</div>
                                        <div className={'B3 SemiBold ColorNeutral040'}>({nftPresaleStore.getPresalePriceUsdFormatted()})</div>
                                        { renderPresaleBuyWithCudos() }
                                    </div>
                                    <div className={'PriceWithIcon FlexRow'}>
                                        <Svg svg={SvgEthereumLogo} size={SvgSize.CUSTOM} />
                                        <div className={'PriceItself Bold ColorNeutral100'}>{nftPresaleStore.getPresalePriceEthFormatted()}</div>
                                        <div className={'B3 SemiBold ColorNeutral040'}>({nftPresaleStore.getPresalePriceUsdFormatted()})</div>
                                        { renderPresaleBuyWithEth() }
                                    </div>
                                </div>
                                { accountSessionStore.isLoggedInAndWalletConnected() === false ? (
                                    <>
                                        <div className={'PurchaseNoWallet Bold'} >
                                            Please <span className = { 'ColorPrimary060 Clickable' } onClick = { onClickConnectWallet }>connect your wallet</span> to purchase
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {nftPresaleStore.isUserEligibleToBuy() === false ? (
                                            <>
                                                { fetchingKyc === false && (
                                                    <span className = { 'PurchaseError Bold' }>You are not whitelisted and therefore must wait until the public sale to purchase an NFT.<br />Head over to our <a className = { 'ColorPrimary060' } href="https://discord.gg/7DPZ45C4ms" target='_blank' rel="noreferrer">Discord</a> to get whitelisted for future collections.</span>
                                                ) }
                                            </>
                                        ) : (
                                            <>
                                                { kycStore.canBuyPresaleNft() === false ? (
                                                    <>
                                                        { renderKycWarnings() }
                                                    </>
                                                ) : (
                                                    <>
                                                        <Checkbox
                                                            label = { (
                                                                <div>I accept the <a href = { TERMS_AND_CONDITIONS } target="_blank" rel="noopener noreferrer" className = { 'ColorPrimary060' } onClick = { S.stopPropagation } >Terms and Conditions</a> of CUDOS Markets platform</div>
                                                            ) }
                                                            value = { acceptTermsAndConditions }
                                                            onChange = { setAcceptTermsAndConditions } />
                                                    </>
                                                ) }
                                            </>
                                        ) }
                                    </>
                                ) }
                            </ColumnLayout>

                            <RowLayout className = { 'NftPresalePreviewCnt' } numColumns = { 5 } gap = { 16 } >
                                <MarketPresaleNftPreview
                                    imgUrl = { '/assets/presale-nft-images/H-1_small.jpg' }
                                    name = { 'Opal' }
                                    hashRateInTh = { 5 }
                                    svgPath = { SvgOpal }
                                    whiteText = { false } />
                                <MarketPresaleNftPreview
                                    imgUrl = { '/assets/presale-nft-images/H-2_small.jpg' }
                                    name = { 'Ruby' }
                                    hashRateInTh = { 10 }
                                    svgPath = { SvgRuby }
                                    whiteText = { false } />
                                <MarketPresaleNftPreview
                                    imgUrl = { '/assets/presale-nft-images/H-3_small.jpg' }
                                    name = { 'Emerald' }
                                    hashRateInTh = { 33 }
                                    svgPath = { SvgEmerald }
                                    whiteText = { false } />
                                <MarketPresaleNftPreview
                                    imgUrl = { '/assets/presale-nft-images/H-4_small.jpg' }
                                    name = { 'Diamond' }
                                    hashRateInTh = { 100 }
                                    svgPath = { SvgDiamond }
                                    whiteText = { false } />
                                <MarketPresaleNftPreview
                                    imgUrl = { '/assets/presale-nft-images/H-5_small.jpg' }
                                    name = { 'Blue Diamond' }
                                    hashRateInTh = { 170 }
                                    svgPath = { SvgBlueDiamond }
                                    whiteText = { false } />
                            </RowLayout>

                            <div className = { 'NftPresaleLuckyCnt FlexRow' } >
                                <div className = { 'LuckyDesc Bold' } >
                                    If you are<br />super lucky,<br /> you may get
                                    <div className={'LuckyGradient'} >one of these<br /> exclusive 1/1<br /> NFT’s</div>
                                </div>
                                <RowLayout className = { 'NftPresalePreviewLuckyCnt' } numColumns = { 3 } gap = { 16 } >
                                    <MarketPresaleNftPreview
                                        imgUrl = { '/assets/presale-nft-images/H-11_small.jpg' }
                                        name = { 'Ruby' }
                                        hashRateInTh = { 10 }
                                        svgPath = { SvgRuby }
                                        whiteText = { true } />
                                    <MarketPresaleNftPreview
                                        imgUrl = { '/assets/presale-nft-images/H-12_small.jpg' }
                                        name = { 'Emerald' }
                                        hashRateInTh = { 33 }
                                        svgPath = { SvgEmerald }
                                        whiteText = { true } />
                                    <MarketPresaleNftPreview
                                        imgUrl = { '/assets/presale-nft-images/H-13_small.jpg' }
                                        name = { 'Diamond' }
                                        hashRateInTh = { 100 }
                                        svgPath = { SvgDiamond }
                                        whiteText = { true } />
                                </RowLayout>
                            </div>
                        </StyledContainer>
                    </ColumnLayout>
                )}
            </div>
            <PageFooter />
            <ScrollDown />
        </PageLayout>
    )
}

export default inject((stores) => stores)(observer(MarkedplacePage));
