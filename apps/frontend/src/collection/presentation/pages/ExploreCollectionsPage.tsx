import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import CollectionEntity from '../../entities/CollectionEntity';
import ExploreCollectionsPageStore from '../stores/ExploreCollectionsPageStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PageLayout from '../../../core/presentation/components/PageLayout';
import Input, { InputType } from '../../../core/presentation/components/Input';
import Svg from '../../../core/presentation/components/Svg';
import PageHeader from '../../../layout/presentation/components/PageHeader';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import GridView from '../../../core/presentation/components/GridView';
import CollectionPreview from '../components/CollectionPreview';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import ExplorePageLayout from '../../../core/presentation/components/ExplorePageLayout';
import DataGridLayout from '../../../core/presentation/components/DataGridLayout';
import NavRowTabs, { createNavRowTab } from '../../../core/presentation/components/NavRowTabs';

import '../styles/page-explore-collections.css';

type Props = {
    exploreCollectionsPageStore?: ExploreCollectionsPageStore;
}

function ExploreCollectionsPage({ exploreCollectionsPageStore }: Props) {
    const navigate = useNavigate();

    useEffect(() => {
        async function run() {
            await exploreCollectionsPageStore.init();
        }

        run();
    }, []);

    function onClickExploreNfts() {
        navigate(AppRoutes.EXPLORE_NFTS);
    }

    function onClickExploreMiningFarms() {
        navigate(AppRoutes.EXPLORE_MINING_FARMS);
    }

    const collectionFilterModel = exploreCollectionsPageStore.collectionFilterModel;

    return (
        <PageLayout className = { 'PageExploreCollections' } >

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

        </PageLayout>
    )

}

export default inject((stores) => stores)(observer(ExploreCollectionsPage));
