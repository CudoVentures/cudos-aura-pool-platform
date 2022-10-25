import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import CollectionEntity from '../../entities/CollectionEntity';
import CollectionFilterModel, { CollectionHashPowerFilter } from '../../utilities/CollectionFilterModel';
import AppStore from '../../../../core/presentation/stores/AppStore';
import ExploreCollectionsPageStore from '../stores/ExploreCollectionsPageStore';

import { InputAdornment, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import Input, { InputType } from '../../../../core/presentation/components/Input';
import Svg from '../../../../core/presentation/components/Svg';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import Select from '../../../../core/presentation/components/Select';
import GridView from '../../../../core/presentation/components/GridView';
import CollectionPreview from '../components/CollectionPreview';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import ExplorePageLayout from '../../../../core/presentation/components/ExplorePageLayout';
import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';

import '../styles/page-explore-collections-component.css';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import NavRowTabs from '../../../../core/presentation/components/NavRowTabs';
import { useNavigate } from 'react-router-dom';

type Props = {
    appStore?: AppStore;
    exploreCollectionsPageStore?: ExploreCollectionsPageStore;
}

function ExploreCollectionsPage({ appStore, exploreCollectionsPageStore }: Props) {
    const navigate = useNavigate();

    useEffect(() => {
        appStore.useLoading(async () => {
            await exploreCollectionsPageStore.init();
        });
    }, [])

    const collectionFilterModel = exploreCollectionsPageStore.collectionFilterModel;

    const navTabs = [
        {
            navName: 'NFTs',
            isActive: false,
            onClick: () => navigate(AppRoutes.EXPLORE_NFTS),
        },
        {
            navName: 'Collections',
            isActive: true,
        },
        {
            navName: 'Farms',
            isActive: false,
            onClick: () => navigate(AppRoutes.EXPLORE_MINING_FARMS),
        },
    ]
    return (
        <PageLayoutComponent className = { 'PageExploreCollections' } >

            <PageHeader />

            <div className={'PageContent AppContent'} >

                <ExplorePageLayout
                    header = { (
                        <>
                            <div className={'H1 Bold'}>Explore AuraPool</div>
                            <NavRowTabs navTabs={navTabs} />
                        </>
                    ) }>

                    <DataGridLayout
                        headerLeft = { (
                            <>
                                <Input
                                    inputType={InputType.TEXT}
                                    className={'SearchBar'}
                                    value = {collectionFilterModel.searchString}
                                    onChange = { exploreCollectionsPageStore.onChangeSearchWord }
                                    placeholder = {'Search Collections name'}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >
                                            <Svg svg={SearchIcon} />
                                        </InputAdornment>,
                                    }} />
                                <Select
                                    label={'Hashing Power'}
                                    onChange={exploreCollectionsPageStore.onChangeHashPowerFilter}
                                    value={collectionFilterModel.hashPowerFilter} >
                                    <MenuItem value = { CollectionHashPowerFilter.NONE } > </MenuItem>
                                    <MenuItem value = { CollectionHashPowerFilter.BELOW_1000_EH } > Below 1000 EH/s </MenuItem>
                                    <MenuItem value = { CollectionHashPowerFilter.BELOW_2000_EH } > Below 2000 EH/s </MenuItem>
                                    <MenuItem value = { CollectionHashPowerFilter.ABOVE_2000_EH } > Above 2000 EH/s </MenuItem>
                                </Select>
                            </>
                        ) }
                        headerRight = { (
                            <Select
                                onChange={exploreCollectionsPageStore.onChangeSortKey}
                                value={collectionFilterModel.sortKey} >
                                <MenuItem value = { CollectionFilterModel.SORT_KEY_NAME } > Name </MenuItem>
                                <MenuItem value = { CollectionFilterModel.SORT_KEY_PRICE } > Price </MenuItem>
                            </Select>
                        ) } >

                        { exploreCollectionsPageStore.collectionEntities === null && (
                            <LoadingIndicator />
                        ) }

                        { exploreCollectionsPageStore.collectionEntities !== null && (
                            <GridView
                                gridViewState={exploreCollectionsPageStore.gridViewState}
                                defaultContent={exploreCollectionsPageStore.collectionEntities.length === 0 ? <div className={'NoContentFound'}>No Nfts found</div> : null} >
                                { exploreCollectionsPageStore.collectionEntities.map((collectionEntity: CollectionEntity) => {
                                    return (
                                        <CollectionPreview
                                            key={collectionEntity.id}
                                            collectionEntity={collectionEntity}
                                            miningFarmName={exploreCollectionsPageStore.getMiningFarmName(collectionEntity.farmId)} />
                                    )
                                }) }
                            </GridView>
                        ) }

                    </DataGridLayout>

                </ExplorePageLayout>

            </div>

            <PageFooter />

        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(ExploreCollectionsPage));
