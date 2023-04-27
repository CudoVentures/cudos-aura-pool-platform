import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import NftEntity, { tierPriceMap, NftTier } from '../../entities/NftEntity';
import ExploreNftsPageStore from '../stores/ExploreNftsPageStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import { formatUsd } from '../../../core/utilities/NumberFormatter';

import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Input, { InputType } from '../../../core/presentation/components/Input';
import PageLayout from '../../../core/presentation/components/PageLayout';
import Svg from '../../../core/presentation/components/Svg';
import PageHeader from '../../../layout/presentation/components/PageHeader';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import GridView from '../../../core/presentation/components/GridView';
import NftPreview from '../components/NftPreview';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import ExplorePageLayout from '../../../core/presentation/components/ExplorePageLayout';
import DataGridLayout from '../../../core/presentation/components/DataGridLayout';
import NavRowTabs, { createNavRowTab } from '../../../core/presentation/components/NavRowTabs';
import StyledContainer, { ContainerPadding } from '../../../core/presentation/components/StyledContainer';
import OpalSvg from '../../../public/assets/vectors/opal.svg';
import RubySvg from '../../../public/assets/vectors/ruby.svg';
import EmeraldSvg from '../../../public/assets/vectors/emerald.svg';
import DiamondSvg from '../../../public/assets/vectors/diamond.svg';
import BlueDiamondSvg from '../../../public/assets/vectors/blue-diamond.svg';
import FilterListIcon from '@mui/icons-material/FilterList';

import '../styles/page-explore-nfts.css';
import Select from '../../../core/presentation/components/Select';
import { MenuItem } from '@mui/material';
import { NftEventType } from '../../../analytics/entities/NftEventEntity';
import { NftOrderBy, NftPriceType } from '../../utilities/NftFilterModel';
import S from '../../../core/utilities/Main';
import Expandable from '../../../core/presentation/components/Expandable';
import Checkbox from '../../../core/presentation/components/Checkbox';

type Props = {
    exploreNftsPageStore?: ExploreNftsPageStore;
}

function ExploreNftsPage({ exploreNftsPageStore }: Props) {
    const navigate = useNavigate();

    useEffect(() => {
        async function run() {
            exploreNftsPageStore.init();
        }

        run();
    }, [])

    const nftFilterModel = exploreNftsPageStore.nftFilterModel;

    function onClickExploreCollections() {
        navigate(AppRoutes.EXPLORE_COLLECTIONS)
    }

    function onClickExploreMiningFarms() {
        navigate(AppRoutes.EXPLORE_MINING_FARMS);
    }

    return (
        <PageLayout className = { 'PageExploreNfts' } >

            <PageHeader />

            <div className={'PageContent AppContent'} >

                <ExplorePageLayout
                    header = { (
                        <>
                            <div className={'H2 Bold'}>Explore CUDOS Markets</div>
                            <NavRowTabs navTabs = {[
                                createNavRowTab('NFTs', true),
                                createNavRowTab('Collections', false, onClickExploreCollections),
                                createNavRowTab('Farms', false, onClickExploreMiningFarms),
                            ]} />
                        </>
                    ) }>
                    <>
                        <StyledContainer className = { 'InitialPublicPricesCnt' } containerPadding = { ContainerPadding.PADDING_16 } >
                            <div className={'FlexRow'}>
                                <div><b>Initial Public Prices:</b></div>
                                <div className={'NftRanksHolder FlexRow'}>
                                    <div className={'FlexRow NftRank'}>
                                        <Svg svg={OpalSvg} />
                                        Opal: {formatUsd(tierPriceMap.get(NftTier.TIER_1))}
                                    </div>
                                    <div className={'FlexRow NftRank'}>
                                        <Svg svg={RubySvg} />
                                        Ruby: {formatUsd(tierPriceMap.get(NftTier.TIER_2))}
                                    </div>
                                    <div className={'FlexRow NftRank'}>
                                        <Svg svg={EmeraldSvg} />
                                        Emerald: {formatUsd(tierPriceMap.get(NftTier.TIER_3))}
                                    </div>
                                    <div className={'FlexRow NftRank'}>
                                        <Svg svg={DiamondSvg} />
                                        Diamond: {formatUsd(tierPriceMap.get(NftTier.TIER_4))}
                                    </div>
                                    <div className={'FlexRow NftRank'}>
                                        <Svg svg={BlueDiamondSvg} />
                                        Blue Diamond: {formatUsd(tierPriceMap.get(NftTier.TIER_5))}
                                    </div>
                                </div>
                            </div>
                        </StyledContainer>
                        <DataGridLayout
                            headerLeft = { (
                                <div
                                    className={`OpenFilterSectionButton Clickable FlexRow ${S.CSS.getActiveClassName(exploreNftsPageStore.showFilterSection)}`}
                                    onClick = { exploreNftsPageStore.toggleOpenFilterSection }
                                >
                                    <Svg svg={FilterListIcon} />
                                    Filter
                                </div>
                            )}

                            headerRight = { (
                                <>
                                    <Input
                                        inputType={InputType.TEXT}
                                        className={'SearchBar'}
                                        value = {nftFilterModel.searchString}
                                        onChange = { exploreNftsPageStore.onChangeSearchWord }
                                        placeholder = {'Search for NFT...'}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start" >
                                                <Svg svg={SearchIcon} />
                                            </InputAdornment>,
                                        }} />
                                    <Select
                                        className={'TableFilter'}
                                        onChange={exploreNftsPageStore.onChangeSortType}
                                        value={exploreNftsPageStore.nftFilterModel.orderBy} >
                                        <MenuItem value = { NftOrderBy.PRICE_ASC }> Price Low to High </MenuItem>
                                        <MenuItem value = { NftOrderBy.PRICE_DESC }> Price High to Low </MenuItem>
                                        <MenuItem value = { NftOrderBy.HASH_RATE_ASC }> Hashrate High to Low </MenuItem>
                                        <MenuItem value = { NftOrderBy.HASH_RATE_DESC }> Hashrate Low to High </MenuItem>
                                        <MenuItem value = { NftOrderBy.EXPIRY_ASC }> Expiry date Low to High </MenuItem>
                                        <MenuItem value = { NftOrderBy.EXPIRY_DESC }> Expiry date High to Low </MenuItem>
                                    </Select>
                                </>
                            ) } >

                            { exploreNftsPageStore.nftEntities === null && (
                                <LoadingIndicator />
                            ) }

                            { exploreNftsPageStore.nftEntities !== null && (
                                <div className={'GridAndFilterContainer FlexRow'}>
                                    {exploreNftsPageStore.showFilterSection === true && (<div className={'NftFiltersTab FlexColumn'}>
                                        <Expandable
                                            className={'FilterExpandable'}
                                            expanded={true}
                                            title={<div className={'B1 SemiBold'}>TH/s Range</div>}
                                        >
                                            <div className={'FlexRow FilterInputGrid'}>
                                                <Input
                                                    centered={true}
                                                    gray={true}
                                                    inputType={InputType.INTEGER}
                                                    className={'FilterInput'}
                                                    value = {exploreNftsPageStore.getHashRateMinValue()}
                                                    onChange = { exploreNftsPageStore.onChangeHashRateMin }
                                                    placeholder = {'Min'} />
                                                <div className={'B2 FlexRow InputSeparator'}>To</div>
                                                <Input
                                                    centered={true}
                                                    gray={true}
                                                    inputType={InputType.INTEGER}
                                                    className={'FilterInput'}
                                                    value = {exploreNftsPageStore.getHashRateMaxValue()}
                                                    onChange = { exploreNftsPageStore.onChangeHashRateMax }
                                                    placeholder = {'Max'} />
                                            </div>
                                        </Expandable>
                                        <div className={'HorizontalSeparator'} />
                                        <Expandable
                                            className={'FilterExpandable'}
                                            expanded={true}
                                            title={<div className={'B1 SemiBold'}>Price Range</div>}
                                        >
                                            <div className={'FilterInputGrid'}>
                                                <Select
                                                    gray={true}
                                                    centered={true}
                                                    onChange={exploreNftsPageStore.onChangePriceType}
                                                    value={exploreNftsPageStore.nftFilterModel.priceFilterType} >
                                                    <MenuItem value = { NftPriceType.USD }> USD </MenuItem>
                                                    <MenuItem value = { NftPriceType.CUDOS }> CUDOS </MenuItem>
                                                </Select>
                                                <div/>
                                                <div/>
                                                <Input
                                                    centered={true}
                                                    gray={true}
                                                    inputType={InputType.INTEGER}
                                                    className={'FilterInput'}
                                                    value = {exploreNftsPageStore.getPriceMinValue()}
                                                    onChange = { exploreNftsPageStore.onChangePriceMin }
                                                    placeholder = {'Min'} />
                                                <div className={'B2 FlexRow InputSeparator'}>To</div>
                                                <Input
                                                    centered={true}
                                                    gray={true}
                                                    inputType={InputType.INTEGER}
                                                    className={'FilterInput'}
                                                    value = {exploreNftsPageStore.getPriceMaxValue()}
                                                    onChange = { exploreNftsPageStore.onChangePriceMax }
                                                    placeholder = {'Max'} />
                                            </div>
                                        </Expandable>
                                        <div className={'HorizontalSeparator'} />
                                        <Expandable
                                            className={'FilterExpandable'}
                                            expanded={true}
                                            title={<div className={'B1 SemiBold'}>Expiry Date</div>}
                                        >
                                            <div className={'FlexColumn CheckboxContainer'}>
                                                <Checkbox
                                                    label={'Less than a year'}
                                                    value={exploreNftsPageStore.selectedExpirationPeriod[0]}
                                                    onChange={() => exploreNftsPageStore.onChangeExpirationPeriod(0)}
                                                />
                                                <Checkbox
                                                    label={'More than a year'}
                                                    value={exploreNftsPageStore.selectedExpirationPeriod[1]}
                                                    onChange={() => exploreNftsPageStore.onChangeExpirationPeriod(1)}
                                                />
                                                <Checkbox
                                                    label={'More than 2 years'}
                                                    value={exploreNftsPageStore.selectedExpirationPeriod[2]}
                                                    onChange={() => exploreNftsPageStore.onChangeExpirationPeriod(2)}
                                                />
                                                <Checkbox
                                                    label={'More than 3 years'}
                                                    value={exploreNftsPageStore.selectedExpirationPeriod[3]}
                                                    onChange={() => exploreNftsPageStore.onChangeExpirationPeriod(3)}
                                                />
                                            </div>
                                        </Expandable>
                                    </div>)}
                                    <GridView
                                        className={'NftGrid'}
                                        gridViewState={exploreNftsPageStore.gridViewState}
                                        defaultContent={exploreNftsPageStore.nftEntities.length === 0 ? <div className={'NoContentFound'}>No Nfts found</div> : null}>
                                        {exploreNftsPageStore.nftEntities.map(
                                            (nftEntity: NftEntity, index: number) => {
                                                return (
                                                    <NftPreview
                                                        key={index}
                                                        nftEntity={nftEntity}
                                                        collectionName={exploreNftsPageStore.getCollectioName(nftEntity.collectionId)} />
                                                )
                                            },
                                        )}
                                    </GridView>
                                </div>
                            ) }

                        </DataGridLayout>
                    </>
                </ExplorePageLayout>

            </div>

            <PageFooter />

        </PageLayout>
    )

}

export default inject((stores) => stores)(observer(ExploreNftsPage));
