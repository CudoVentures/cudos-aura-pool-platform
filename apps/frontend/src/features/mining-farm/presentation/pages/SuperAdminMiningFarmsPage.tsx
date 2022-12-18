import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react'
import BigNumber from 'bignumber.js';

import SuperAdminMningFarmsPageStore from '../stores/SuperAdminMningFarmsPageStore';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';

import { InputAdornment } from '@mui/material';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent'
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import ChangePasswordModal from '../../../accounts/presentation/components/ChangePasswordModal';
import ViewMiningFarmModal from '../components/ViewMiningFarmModal';
import QueuedMiningFarms from '../components/QueuedMiningFarms';
import StyledLayout from '../../../../core/presentation/components/StyledLayout';
import Input from '../../../../core/presentation/components/Input';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import Svg from '../../../../core/presentation/components/Svg';
import Table, { createTableCell, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';

import SearchIcon from '@mui/icons-material/Search';
import '../styles/page-super-admin-mining-farms.css'

type Props = {
    superAdminMiningFarmsPageStore?: SuperAdminMningFarmsPageStore;
    cudosStore?: CudosStore;
}

function SuperAdminMiningFarmsPage({ superAdminMiningFarmsPageStore, cudosStore }: Props) {
    useEffect(() => {
        superAdminMiningFarmsPageStore.init();
    }, []);

    const { tableState, miningFarmFilterModel, miningFarmEntities } = superAdminMiningFarmsPageStore;

    function renderAllFarmsRows() {
        return miningFarmEntities.map((miningFarmEntity) => createTableRow([
            createTableCell((
                <div className = { 'FlexRow Bold' } >
                    <div className = { 'MiningFarmImg ImgCoverNode' } style = { ProjectUtils.makeBgImgStyle(miningFarmEntity.coverImgUrl) } />
                    { miningFarmEntity.name }
                </div>
            )),
            createTableCell((
                <div className = { 'Bold' } >
                    <div className={'B2 Bold MiningFarmsCellTitle'}>3,4K CUDOS</div>
                    <div className={'B3 FlexRow FarmVolumePriceRow'}>
                        <div className={'SemiBold ColorNeutral060'}>$1.4M</div>
                        <div className={'ColorSuccess060'}>+39.1%</div>
                    </div>
                </div>
            )),
            createTableCell((
                <div className = { 'Bold' } >
                    <div className={'B2 Bold MiningFarmsCellTitle'}>1K CUDOS</div>
                    <div className={'B3 SemiBold Gray ColorNeutral060'}>{cudosStore.formatConvertedAcudosInUsd(new BigNumber(10000000000000000000000))}</div>
                </div>
            )),
            createTableCell((
                <div className = { 'Bold' } >
                    { miningFarmEntity.formatHashPowerInTh() }
                </div>
            )),
        ]))
    }

    return (
        <PageLayoutComponent
            className = { 'PageSuperAdminMiningFarms' }
            modals = { (
                <>
                    <ChangePasswordModal />
                    <ViewMiningFarmModal />
                </>
            ) } >

            <PageSuperAdminHeader />
            <ColumnLayout className={'PageContent PageContentDefaultPadding AppContent'} >
                <div className={'H2 ExtraBold'}>Farms</div>
                <QueuedMiningFarms dashboardMode = { false } />
                <StyledLayout
                    title = { `All Farms (${tableState.tableFilterState.total})` }
                    headerRight = {
                        <Input
                            className={'SearchInput'}
                            placeholder={'Search Farms'}
                            value={miningFarmFilterModel.searchString}
                            onChange={superAdminMiningFarmsPageStore.onChangeSearchWord}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" >
                                    <Svg svg={SearchIcon}/>
                                </InputAdornment>,
                            }} />
                    }>
                    { miningFarmEntities === null ? (
                        <LoadingIndicator />
                    ) : (
                        <Table
                            className={'AllMiningFarmsTable'}
                            legend={['Farm', '24H Volume', 'Floor Price', 'Total Hashrate']}
                            widths={['40%', '20%', '20%', '20%']}
                            aligns={[ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT]}
                            tableState={tableState}
                            rows={renderAllFarmsRows()} />
                    )}
                </StyledLayout>
            </ColumnLayout>

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(SuperAdminMiningFarmsPage));
