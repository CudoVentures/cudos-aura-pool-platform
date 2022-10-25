import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import NftEntity from '../../entities/NftEntity';
import NftFilterModel, { NftHashPowerFilter, NftPriceSortDirection } from '../../utilities/NftFilterModel';
import ExploreNftsPageStore from '../stores/ExploreNftsPageStore';
import AppStore from '../../../../core/presentation/stores/AppStore';

import { InputAdornment, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Input, { InputType } from '../../../../core/presentation/components/Input';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import Svg from '../../../../core/presentation/components/Svg';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import Select from '../../../../core/presentation/components/Select';
import GridView from '../../../../core/presentation/components/GridView';
import NftPreview from '../components/NftPreview';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import ExplorePageLayout from '../../../../core/presentation/components/ExplorePageLayout';
import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';

import '../styles/page-explore-nfts-component.css';
import NavRowTabs from '../../../../core/presentation/components/NavRowTabs';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import { useNavigate } from 'react-router-dom';

type Props = {
    appStore?: AppStore;
    exploreNftsPageStore?: ExploreNftsPageStore;
}

function ExploreNftsPage({ appStore, exploreNftsPageStore }: Props) {
    const navigate = useNavigate();

    useEffect(() => {
        appStore.useLoading(async () => {
            exploreNftsPageStore.init();
        });
    }, [])

    const nftFilterModel = exploreNftsPageStore.nftFilterModel;

    const navTabs = [
        {
            navName: 'NFTs',
            isActive: true,
        },
        {
            navName: 'Collections',
            isActive: false,
            onClick: () => navigate(AppRoutes.EXPLORE_COLLECTIONS),
        },
        {
            navName: 'Farms',
            isActive: false,
            onClick: () => navigate(AppRoutes.EXPLORE_MINING_FARMS),
        },
    ]

    return (
        <PageLayoutComponent className = { 'PageExploreNfts' } >

            <PageHeader />

            <div className={'PageContent AppContent'} >

                <ExplorePageLayout
                    header = { (
                        <>
                            <div className={'H2 Bold'}>Explore AuraPool</div>
                            <NavRowTabs navTabs={navTabs} />
                        </>
                    ) }>

                    <DataGridLayout
                        headerLeft = { (
                            <>
                                <Input
                                    inputType={InputType.TEXT}
                                    className={'SearchBar'}
                                    value = {nftFilterModel.searchString}
                                    onChange = { exploreNftsPageStore.onChangeSearchWord }
                                    placeholder = {'Search Collections, Farms and accounts'}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >
                                            <Svg svg={SearchIcon} />
                                        </InputAdornment>,
                                    }} />
                                <Select
                                    label={'Hashing Power'}
                                    onChange={exploreNftsPageStore.onChangeHashPowerFilter}
                                    value={nftFilterModel.hashPowerFilter} >
                                    <MenuItem value = { NftHashPowerFilter.NONE } > None</MenuItem>
                                    <MenuItem value = { NftHashPowerFilter.BELOW_1000_EH } > Below 1000 EH/s </MenuItem>
                                    <MenuItem value = { NftHashPowerFilter.BELOW_2000_EH } > Below 2000 EH/s </MenuItem>
                                    <MenuItem value = { NftHashPowerFilter.ABOVE_2000_EH } > Above 2000 EH/s </MenuItem>
                                </Select>
                                <Select
                                    label={'Price'}
                                    onChange={exploreNftsPageStore.onChangeSortPriceDirection}
                                    value={nftFilterModel.sortPriceDirection} >
                                    <MenuItem value = { NftPriceSortDirection.NONE } >None</MenuItem>
                                    <MenuItem value = { NftPriceSortDirection.HIGH_TO_LOW } > Low to High </MenuItem>
                                    <MenuItem value = { NftPriceSortDirection.LOW_TO_HIGH } > High to Low </MenuItem>
                                </Select>
                            </>
                        ) }
                        headerRight = { (
                            <Select
                                // label={'Sort by'}
                                onChange={exploreNftsPageStore.onChangeSortKey}
                                value={nftFilterModel.sortKey} >
                                <MenuItem value = { NftFilterModel.SORT_KEY_NAME } > Name </MenuItem>
                                <MenuItem value = { NftFilterModel.SORT_KEY_POPULAR } > Popular </MenuItem>
                            </Select>
                        ) } >

                        { exploreNftsPageStore.nftEntities === null && (
                            <LoadingIndicator />
                        ) }

                        { exploreNftsPageStore.nftEntities !== null && (
                            <GridView
                                gridViewState={exploreNftsPageStore.gridViewState}
                                defaultContent={exploreNftsPageStore.nftEntities.length === 0 ? <div className={'NoContentFound'}>No Nfts found</div> : null}>>
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
                        ) }

                    </DataGridLayout>

                </ExplorePageLayout>

            </div>

            <PageFooter />

        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(ExploreNftsPage));
