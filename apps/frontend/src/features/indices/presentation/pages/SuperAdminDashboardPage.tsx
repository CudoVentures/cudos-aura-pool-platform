import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import ViewCollectionModal from '../../../collection/presentation/components/ViewCollectionModal';
import ViewMiningFarmModal from '../../../mining-farm/presentation/components/ViewMiningFarmModal';
import ChangePasswordModal from '../../../accounts/presentation/components/ChangePasswordModal';
import SuperAdminDashboardPageStore from '../stores/SuperAdminDashboardPageStore';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import QueuedCollections from '../../../collection/presentation/components/QueuedCollections';
import QueuedMiningFarms from '../../../mining-farm/presentation/components/QueuedMiningFarms';
import StyledLayout from '../../../../core/presentation/components/StyledLayout';
import Button, { ButtonPadding } from '../../../../core/presentation/components/Button';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import Table, { createTableCell, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_CENTER, ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import DefaultIntervalPicker from '../../../analytics/presentation/components/DefaultIntervalPicker';
import RowLayout from '../../../../core/presentation/components/RowLayout';

import '../styles/page-super-admin-dashboard.css';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import BigNumber from 'bignumber.js';

type Props = {
    superAdminDashboardPageStore?: SuperAdminDashboardPageStore
    cudosStore?: CudosStore;
}

function SuperAdminDashboardPage({ superAdminDashboardPageStore, cudosStore }: Props) {
    const topPerformingFarms = superAdminDashboardPageStore.topPerformingFarms;
    const defaultIntervalPickerState = superAdminDashboardPageStore.defaultIntervalPickerState;

    const navigate = useNavigate();

    useEffect(() => {
        cudosStore.init();
        superAdminDashboardPageStore.init();
    }, []);

    function onClickAllFarms() {
        navigate(AppRoutes.SUPER_ADMIN_MINING_FARMS);
    }

    function onClickTopFarmRow(i: number) {
        const miningFarmEntity = topPerformingFarms[i];
        navigate(`${AppRoutes.CREDIT_MINING_FARM}/${miningFarmEntity.id}`);
    }

    // TODO: get real statistics
    function renderTopPerformingFarmRows() {
        return topPerformingFarms.map((miningFarmEntity) => {
            const miningFarmDetailsEntity = superAdminDashboardPageStore.getMiningFarmDetails(miningFarmEntity.id);
            return createTableRow([
                createTableCell((
                    <div className = { 'FlexRow Bold' } >
                        <div className = { 'TopPerformingMiningFarmImg ImgCoverNode' } style = { ProjectUtils.makeBgImgStyle(miningFarmEntity.coverImgUrl) } />
                        { miningFarmEntity.name }
                    </div>
                )),
                createTableCell((
                    <div className = { 'Bold' } >
                        <div className={'B2 Bold TopPerformingMiningFarmsCellTitle'}>3,4K CUDOS</div>
                        <div className={'B3 FlexRow FarmVolumePriceRow'}>
                            <div className={'SemiBold ColorNeutral060'}>$1.4M</div>
                            <div className={'ColorSuccess060'}>+39.1%</div>
                        </div>
                    </div>
                )),
                createTableCell((
                    <div className = { 'Bold' } >
                        <div className={'B2 Bold TopPerformingMiningFarmsCellTitle'}>1K CUDOS</div>
                        <div className={'B3 SemiBold Gray ColorNeutral060'}>{cudosStore.formatConvertedAcudosInUsd(new BigNumber(10000000000000000000000))}</div>
                    </div>
                )),
            ]);
        });
    }

    return (
        <PageLayoutComponent
            className = { 'PageSuperAdminDashboard' }
            modals = { (
                <>
                    <ChangePasswordModal />
                    <ViewCollectionModal />
                    <ViewMiningFarmModal />
                </>
            ) }>

            <PageSuperAdminHeader />
            <ColumnLayout className = { 'PageContent PageContentDefaultPadding AppContent' } >
                <div className={'H2 ExtraBold'}>Dashboard</div>
                <RowLayout numColumns = { 2 }>
                    <div></div>
                    <StyledLayout
                        className = { 'BestPerformingFarms' }
                        title = { 'Top 5 Best Permorfming Farms' }
                        hasBottomDivider = { true }
                        headerRight = {
                            <DefaultIntervalPicker defaultIntervalPickerState = { defaultIntervalPickerState } />
                        }
                        bottomRightButtons = {
                            <Button padding = { ButtonPadding.PADDING_48 } onClick = { onClickAllFarms }>See all farms</Button>
                        } >
                        { topPerformingFarms === null ? (
                            <LoadingIndicator />
                        ) : (
                            <Table
                                className = { 'TopPerformingMiningFarmsTable' }
                                legend={['Farm', '24h Volume', 'Floor Price']}
                                widths={['40%', '30%', '30%']}
                                aligns={[ALIGN_LEFT, ALIGN_CENTER, ALIGN_LEFT]}
                                tableState={superAdminDashboardPageStore.topFarmsTableState}
                                onClickRow = { onClickTopFarmRow }
                                showPaging = { false }
                                rows={renderTopPerformingFarmRows()} />
                        ) }
                    </StyledLayout>
                </RowLayout>
                <QueuedMiningFarms dashboardMode = { true } />
                <QueuedCollections dashboardMode = { true } />
            </ColumnLayout>
            <PageFooter />
        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(SuperAdminDashboardPage));
