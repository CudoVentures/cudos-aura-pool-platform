import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import AppStore from '../../../../core/presentation/stores/AppStore';
import ExploreMiningFarmsPageStore from '../stores/ExploreMiningFarmsPageStore';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import { MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import Input, { InputType } from '../../../../core/presentation/components/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Svg from '../../../../core/presentation/components/Svg';
import GridView from '../../../../core/presentation/components/GridView';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import MiningFarmPeview from '../components/MiningFarmPreview';
import Select from '../../../../core/presentation/components/Select';
import ExplorePageLayout from '../../../../core/presentation/components/ExplorePageLayout';
import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';
import NavRowTabs, { createNavRowTab } from '../../../../core/presentation/components/NavRowTabs';

import '../styles/page-explore-mining-farms-component.css';

type Props = {
    appStore?: AppStore
    exploreMiningFarmsPageStore?: ExploreMiningFarmsPageStore;
}

function ExploreMiningFarmsPage({ appStore, exploreMiningFarmsPageStore }: Props) {
    const navigate = useNavigate();

    useEffect(() => {
        appStore.useLoading(async () => {
            await exploreMiningFarmsPageStore.init();
        });
    }, []);

    const miningFarmFilterModel = exploreMiningFarmsPageStore.miningFarmFilterModel;

    function onClickExploreNfts() {
        navigate(AppRoutes.EXPLORE_NFTS);
    }

    function onClickExploreCollections() {
        navigate(AppRoutes.EXPLORE_COLLECTIONS)
    }

    return (
        <PageLayoutComponent className = { 'PageExploreMiningFarms' } >

            <PageHeader />

            <div className={'PageContent AppContent'} >

                <ExplorePageLayout
                    header = { (
                        <>
                            <div className={'H2 Bold'}>Explore AuraPool</div>
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

                        { exploreMiningFarmsPageStore.miningFarmEntities === null && (
                            <LoadingIndicator />
                        ) }

                        { exploreMiningFarmsPageStore.miningFarmEntities !== null && (
                            <GridView
                                gridViewState={exploreMiningFarmsPageStore.gridViewState}
                                defaultContent={exploreMiningFarmsPageStore.miningFarmEntities.length === 0 ? <div className={'NoContentFound'}>No Farms found</div> : null} >
                                { exploreMiningFarmsPageStore.miningFarmEntities.map((miningFarmEntity: MiningFarmEntity) => {
                                    return (
                                        <MiningFarmPeview
                                            key={miningFarmEntity.id}
                                            miningFarmEntity={miningFarmEntity} />
                                    )
                                }) }
                            </GridView>
                        )}

                    </DataGridLayout>

                </ExplorePageLayout>

            </div>

            <PageFooter />

        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(ExploreMiningFarmsPage));
