import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import CollectionEntity from '../../entities/CollectionEntity';
import AppStore from '../../../../core/presentation/stores/AppStore';
import ExploreCollectionsPageStore from '../stores/ExploreCollectionsPageStore';

import { InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import Input, { InputType } from '../../../../core/presentation/components/Input';
import Svg from '../../../../core/presentation/components/Svg';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import GridView from '../../../../core/presentation/components/GridView';
import CollectionPreview from '../components/CollectionPreview';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import ExplorePageLayout from '../../../../core/presentation/components/ExplorePageLayout';
import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';

import '../styles/page-explore-collections-component.css';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import NavRowTabs, { createNavRowTab } from '../../../../core/presentation/components/NavRowTabs';
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
    }, []);

    function onClickExploreNfts() {
        navigate(AppRoutes.EXPLORE_NFTS);
    }

    function onClickExploreMiningFarms() {
        navigate(AppRoutes.EXPLORE_MINING_FARMS);
    }

    const collectionFilterModel = exploreCollectionsPageStore.collectionFilterModel;

    return (
        <PageLayoutComponent className = { 'PageExploreCollections' } >

            <PageHeader />

            <div className={'PageContent AppContent'} >

                <ExplorePageLayout
                    header = { (
                        <>
                            <div className={'H1 Bold'}>Explore AuraPool</div>
                            <NavRowTabs navTabs = {[
                                createNavRowTab('NFTs', false, onClickExploreNfts),
                                createNavRowTab('Collections', true),
                                createNavRowTab('Farms', false, onClickExploreMiningFarms),
                            ]} />
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
                                    placeholder = {'Search for Collection...'}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >
                                            <Svg svg={SearchIcon} />
                                        </InputAdornment>,
                                    }} />
                            </>
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
                                            miningFarmName={exploreCollectionsPageStore.getMiningFarmName(collectionEntity.farmId)}
                                            displayStatus = { false } />
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
