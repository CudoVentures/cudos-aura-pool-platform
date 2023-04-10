import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import ExploreMiningFarmsPageStore from '../stores/ExploreMiningFarmsPageStore';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import SearchIcon from '@mui/icons-material/Search';
import PageLayout from '../../../core/presentation/components/PageLayout';
import PageHeader from '../../../layout/presentation/components/PageHeader';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import Input, { InputType } from '../../../core/presentation/components/Input';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import Svg from '../../../core/presentation/components/Svg';
import GridView from '../../../core/presentation/components/GridView';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import MiningFarmPeview from '../components/MiningFarmPreview';
import ExplorePageLayout from '../../../core/presentation/components/ExplorePageLayout';
import DataGridLayout from '../../../core/presentation/components/DataGridLayout';
import NavRowTabs, { createNavRowTab } from '../../../core/presentation/components/NavRowTabs';

import '../styles/page-explore-mining-farms.css';

type Props = {
    exploreMiningFarmsPageStore?: ExploreMiningFarmsPageStore;
}

function ExploreMiningFarmsPage({ exploreMiningFarmsPageStore }: Props) {
    const navigate = useNavigate();

    useEffect(() => {
        async function run() {
            await exploreMiningFarmsPageStore.init();
        }

        run();
    }, []);

    const miningFarmFilterModel = exploreMiningFarmsPageStore.miningFarmFilterModel;

    function onClickExploreNfts() {
        navigate(AppRoutes.EXPLORE_NFTS);
    }

    function onClickExploreCollections() {
        navigate(AppRoutes.EXPLORE_COLLECTIONS)
    }

    const miningFarmEntities = exploreMiningFarmsPageStore.miningFarmEntities;
    return (
        <PageLayout className = { 'PageExploreMiningFarms' } >

            <PageHeader />

            <div className={'PageContent AppContent'} >

                <ExplorePageLayout
                    header = { (
                        <>
                            <div className={'H2 Bold'}>Explore CUDOS Markets</div>
                            <NavRowTabs navTabs = {[
                                createNavRowTab('NFTs', false, onClickExploreNfts),
                                createNavRowTab('Collections', false, onClickExploreCollections),
                                createNavRowTab('Farms', true),
                            ]} />
                        </>
                    ) }>

                    <DataGridLayout
                        headerLeft = { (
                            <>
                                <Input
                                    inputType={InputType.TEXT}
                                    className={'SearchBar'}
                                    value = {miningFarmFilterModel.searchString}
                                    onChange = { exploreMiningFarmsPageStore.onChangeSearchWord}
                                    placeholder = {'Search Collections name'}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >
                                            <Svg svg={SearchIcon} />
                                        </InputAdornment>,
                                    }} />
                            </>
                        ) } >

                        { miningFarmEntities === null && (
                            <LoadingIndicator />
                        ) }

                        { miningFarmEntities !== null && (
                            <GridView
                                gridViewState={exploreMiningFarmsPageStore.gridViewState}
                                defaultContent={miningFarmEntities.length === 0 ? <div className={'NoContentFound'}>No Farms found</div> : null} >
                                { miningFarmEntities.map((miningFarmEntity: MiningFarmEntity) => {
                                    const miningFarmDetailsEntity = exploreMiningFarmsPageStore.miningFarmDetailsEntities.find((detailsEntity) => detailsEntity.miningFarmId === miningFarmEntity.id);
                                    return (
                                        <MiningFarmPeview
                                            key={miningFarmEntity.id}
                                            miningFarmEntity={miningFarmEntity}
                                            miningFarmDetailsEntity={miningFarmDetailsEntity} />
                                    )
                                }) }
                            </GridView>
                        )}

                    </DataGridLayout>

                </ExplorePageLayout>

            </div>

            <PageFooter />

        </PageLayout>
    )

}

export default inject((stores) => stores)(observer(ExploreMiningFarmsPage));
