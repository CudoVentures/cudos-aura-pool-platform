import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react'
import BigNumber from 'bignumber.js';
import { useNavigate } from 'react-router-dom';

import SuperAdminMningFarmsPageStore from '../stores/SuperAdminMningFarmsPageStore';
import ProjectUtils from '../../../core/utilities/ProjectUtils';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import { InputAdornment } from '@mui/material';
import PageLayout from '../../../core/presentation/components/PageLayout'
import PageSuperAdminHeader from '../../../layout/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../core/presentation/components/ColumnLayout';
import ChangePasswordModal from '../../../accounts/presentation/components/ChangePasswordModal';
import ViewMiningFarmModal from '../components/ViewMiningFarmModal';
import QueuedMiningFarms from '../components/QueuedMiningFarms';
import StyledLayout from '../../../core/presentation/components/StyledLayout';
import Input from '../../../core/presentation/components/Input';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import Svg from '../../../core/presentation/components/Svg';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../core/presentation/components/Table';
import { ALIGN_LEFT } from '../../../core/presentation/components/TableDesktop';

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

    const navigate = useNavigate();
    const { tableState, miningFarmFilterModel, miningFarmEntities } = superAdminMiningFarmsPageStore;

    function onClickTopFarmRow(i: number) {
        const miningFarmEntity = miningFarmEntities[i];
        navigate(`${AppRoutes.CREDIT_MINING_FARM}/${miningFarmEntity.id}`);
    }

    function renderAllFarmsRows() {
        return miningFarmEntities.map((miningFarmEntity) => {
            const miningFarmDetailsEntity = superAdminMiningFarmsPageStore.getMiningFarmDetails(miningFarmEntity.id);
            return createTableRow([
                createTableCell((
                    <div className = { 'FlexRow Bold' } >
                        <div className = { 'MiningFarmImg ImgCoverNode' } style = { ProjectUtils.makeBgImgStyle(miningFarmEntity.coverImgUrl) } />
                        { miningFarmEntity.name }
                    </div>
                )),
                // createTableCell((
                //     <div className = { 'Bold' } >
                //         <div className={'B2 Bold MiningFarmsCellTitle'}>3,4K CUDOS</div>
                //         <div className={'B3 FlexRow FarmVolumePriceRow'}>
                //             <div className={'SemiBold ColorNeutral060'}>$1.4M</div>
                //             <div className={'ColorSuccess060'}>+39.1%</div>
                //         </div>
                //     </div>
                // )),
                createTableCellString(miningFarmDetailsEntity.totalNftsSold),
                createTableCell((
                    <div className = { 'Bold' } >
                        { miningFarmDetailsEntity.hasFloorPrice() === true ? (
                            <>
                                <div className={'B2 Bold MiningFarmsCellTitle'}>{CudosStore.formatAcudosInCudos(miningFarmDetailsEntity.floorPriceInAcudos)}</div>
                                <div className={'B3 SemiBold Gray ColorNeutral060'}>{cudosStore.formatConvertedAcudosInUsd(miningFarmDetailsEntity.floorPriceInAcudos)}</div>
                            </>
                        ) : (
                            <div className={'B2 Bold MiningFarmsCellTitle'}>No listed NFTs for sale</div>
                        ) }

                    </div>
                )),
                createTableCell((
                    <div className = { 'Bold' } >
                        { miningFarmEntity.formatHashPowerInTh() }
                    </div>
                )),
            ])
        })
    }

    return (
        <PageLayout
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
                            // legend={['Farm', '24H Volume', 'Floor Price', 'Total Hashrate']}
                            legend={['Farm', 'Total sold NFTs', 'Floor Price', 'Total Hashrate']}
                            widths={['40%', '20%', '20%', '20%']}
                            aligns={[ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT]}
                            tableState={tableState}
                            onClickRow = { onClickTopFarmRow }
                            rows={renderAllFarmsRows()} />
                    )}
                </StyledLayout>
            </ColumnLayout>

        </PageLayout>
    )
}

export default inject((stores) => stores)(observer(SuperAdminMiningFarmsPage));
