import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import AppStore from '../../../../core/presentation/stores/AppStore';
import ExploreMiningFarmsPageStore from '../stores/ExploreMiningFarmsPageStore';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel, { MiningFarmHashPowerFilter, MiningFarmPriceSortDirection } from '../../utilities/MiningFarmFilterModel';

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

import '../styles/page-explore-mining-farms-component.css';
import NavRowTabs from '../../../../core/presentation/components/NavRowTabs';
import { useNavigate } from 'react-router-dom';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

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
    const navTabs = [
        {
            navName: 'NFTs',
            isActive: false,
            onClick: () => navigate(AppRoutes.EXPLORE_NFTS),
        },
        {
            navName: 'Collections',
            isActive: false,
            onClick: () => navigate(AppRoutes.EXPLORE_COLLECTIONS),
        },
        {
            navName: 'Farms',
            isActive: true,
        },
    ]
    return (
        <PageLayoutComponent className = { 'PageExploreMiningFarms' } >

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
                                    value = {miningFarmFilterModel.searchString}
                                    onChange = { exploreMiningFarmsPageStore.onChangeSearchWord}
                                    placeholder = {'Search Collections name'}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >
                                            <Svg svg={SearchIcon} />
                                        </InputAdornment>,
                                    }} />
                                <Select
                                    label={'Hashing Power'}
                                    onChange={exploreMiningFarmsPageStore.onChangeHashPowerFilter}
                                    value={miningFarmFilterModel.hashPowerFilter} >
                                    <MenuItem value = { MiningFarmHashPowerFilter.NONE } > None </MenuItem>
                                    <MenuItem value = { MiningFarmHashPowerFilter.BELOW_1000_EH } > Below 1000 EH/s </MenuItem>
                                    <MenuItem value = { MiningFarmHashPowerFilter.BELOW_2000_EH } > Below 2000 EH/s </MenuItem>
                                    <MenuItem value = { MiningFarmHashPowerFilter.ABOVE_2000_EH } > Above 2000 EH/s </MenuItem>
                                </Select>
                                <Select
                                    label={'Price'}
                                    onChange={exploreMiningFarmsPageStore.onChangeSortPriceDirection}
                                    value={miningFarmFilterModel.sortPriceDirection} >
                                    <MenuItem value = { MiningFarmPriceSortDirection.NONE } > None </MenuItem>
                                    <MenuItem value = { MiningFarmPriceSortDirection.HIGH_TO_LOW } > Low to High </MenuItem>
                                    <MenuItem value = { MiningFarmPriceSortDirection.LOW_TO_HIGH } > High to Low </MenuItem>
                                </Select>
                            </>
                        ) }
                        headerRight = { (
                            <Select
                                onChange={exploreMiningFarmsPageStore.onChangeSortKey}
                                value={miningFarmFilterModel.sortKey} >
                                <MenuItem value = { MiningFarmFilterModel.SORT_KEY_NAME } > Name </MenuItem>
                                <MenuItem value = { MiningFarmFilterModel.SORT_KEY_POPULAR } > Popular </MenuItem>
                            </Select>
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
