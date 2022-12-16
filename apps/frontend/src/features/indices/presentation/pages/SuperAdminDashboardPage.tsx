import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import ViewCollectionModal from '../../../collection/presentation/components/ViewCollectionModal';
import ViewMiningFarmModal from '../../../mining-farm/presentation/components/ViewMiningFarmModal';
import ChangePasswordModal from '../../../accounts/presentation/components/ChangePasswordModal';

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import QueuedCollections from '../../../collection/presentation/components/QueuedCollections';
import QueuedMiningFarms from '../../../mining-farm/presentation/components/QueuedMiningFarms';

import '../styles/page-super-admin-dashboard.css';
import StyledLayout from '../../../../core/presentation/components/StyledLayout';
import Button, { ButtonPadding } from '../../../../core/presentation/components/Button';
import SuperAdminDashboardPageStore from '../stores/SuperAdminDashboardPageStore';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import Table, { createTableCell, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_CENTER, ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import DefaultIntervalPicker from '../../../analytics/presentation/components/DefaultIntervalPicker';

type Props = {
    superAdminDashboardPageStore?: SuperAdminDashboardPageStore
}

function SuperAdminDashboardPage({ superAdminDashboardPageStore }: Props) {
    const topPerformingFarms = superAdminDashboardPageStore.topPerformingFarms;
    const defaultIntervalPickerState = superAdminDashboardPageStore.defaultIntervalPickerState;

    const navigate = useNavigate();

    useEffect(() => {
        superAdminDashboardPageStore.init();
    }, []);

    function onClickAllFarms() {
        // TODO: implement
        navigate('TODO');
    }

    function onClickTopFarmRow(i: number) {
        // TODO: implement
    }

    // TODO: get real statistics
    function renderTopPerformingFarmRows() {
        return topPerformingFarms.map((miningFarmEntity) => {
            const miningFarmDetailsEntity = superAdminDashboardPageStore.getMiningFarmDetails(miningFarmEntity.id);
            return createTableRow([
                createTableCell((
                    <div className = { 'FlexRow Bold' } >
                        <div className = { 'QueuedCollectionImg ImgCoverNode' } style = { ProjectUtils.makeBgImgStyle(miningFarmEntity.coverImgUrl) } />
                        { miningFarmEntity.name }
                    </div>
                )),
                createTableCell((
                    <div className = { 'FlexColumn Bold' } >
                        <div className={'B2 Bold'}>3,4K CUDOS</div>
                        <div className={'FlexRow FarmVolumePriceRow'}>
                            <div className={'B3 SemiBold Gray'}>$1.4M</div>
                            <div className={'Green'}>+39.1%</div>
                        </div>
                    </div>
                )),
                createTableCell((
                    <div className = { 'FlexColumn Bold' } >
                        <div className={'B2 Bold'}>1K CUDOS</div>
                        <div className={'B3 SemiBold Gray'}>$0.5M</div>
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

            <PageSuperAdminHeader />Days
            <ColumnLayout className = { 'PageContent AppContent' } >
                <div className={'H1 ExtraBold'}>Dashboard</div>
                <div className={'Grid GridColumns2'}>
                    <div></div>
                    <StyledLayout
                        className = { 'BestPerformingFarms' }
                        title = { 'Top 5 Best Permorfming Farms' }
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
                                legend={['Farm', '24h Volume', 'Floor Price']}
                                widths={['40%', '30%', '30%']}
                                aligns={[ALIGN_LEFT, ALIGN_CENTER, ALIGN_LEFT]}
                                tableState={superAdminDashboardPageStore.topFarmsTableState}
                                onClickRow = { onClickTopFarmRow }
                                showPaging = { false }
                                rows={renderTopPerformingFarmRows()} />
                        ) }
                    </StyledLayout>
                </div>
                <QueuedMiningFarms dashboardMode = { true } />
                <QueuedCollections dashboardMode = { true } />
            </ColumnLayout>
            <PageFooter />
        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(SuperAdminDashboardPage));
