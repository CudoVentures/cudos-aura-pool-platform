import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import SuperAdminDashboardPageStore from '../stores/SuperAdminDashboardPageStore';
import AppStore from '../../../../core/presentation/stores/AppStore';
import ViewCollectionModal from '../../../collection/presentation/components/ViewCollectionModal';
import ViewMiningFarmModal from '../../../mining-farm/presentation/components/ViewMiningFarmModal';
import ViewCollectionModalStore from '../../../collection/presentation/stores/ViewCollectionModalStore';
import ViewMiningFarmModalStore from '../../../mining-farm/presentation/stores/ViewMiningFarmModalStore';
import ChangePasswordModal from '../../../accounts/presentation/components/ChangePasswordModal';

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_LEFT, ALIGN_RIGHT } from '../../../../core/presentation/components/TableDesktop';
import Checkbox from '../../../../core/presentation/components/Checkbox';
import Actions from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';

import '../styles/page-super-admin-dashboard.css';
import QueuedCollections from '../../../collection/presentation/components/QueuedCollections';

type Props = {
    appStore?: AppStore;
    superAdminDashboardPageStore?: SuperAdminDashboardPageStore;
    viewMiningFarmModalStore?: ViewMiningFarmModalStore;
    viewCollectionModalStore?: ViewCollectionModalStore;
}

const TABLE_LEGEND = ['name', 'Select'];
const TABLE_WIDTHS = ['80%', '20%']
const TABLE_ALINGS = [ALIGN_LEFT, ALIGN_RIGHT];

function SuperAdminDashboardPage({ appStore, superAdminDashboardPageStore, viewMiningFarmModalStore, viewCollectionModalStore }: Props) {

    const miningFarmEntities = superAdminDashboardPageStore.miningFarmEntities;

    useEffect(() => {
        appStore.useLoading(() => {
            superAdminDashboardPageStore.init();
        })
    }, []);

    function onClickMiningFarmRow(i: number) {
        viewMiningFarmModalStore.showSignal(miningFarmEntities[i]);
    }

    function onClickSelectMiningFarm(miningFarmEntity, value, e) {
        e.stopPropagation();
        superAdminDashboardPageStore.toggleMiningFarmSelection(miningFarmEntity.id);
    }

    function renderFarmsRows() {
        return miningFarmEntities.map((miningFarmEntity) => {
            return createTableRow([
                createTableCellString(miningFarmEntity.name),
                createTableCell((
                    <Checkbox
                        label={''}
                        value={superAdminDashboardPageStore.isMiningFarmEntitySelected(miningFarmEntity.id)}
                        onChange={onClickSelectMiningFarm.bind(null, miningFarmEntity)} />
                )),
            ])
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
            <ColumnLayout className = { 'PageContent AppContent' } >
                <div className={'H1 ExtraBold'}>Dashboard</div>
                <div>
                    <div className={'FlexRow TableHeader'}>
                        <div className={'H2 Bold'}>Mining Farms of Approval</div>
                        <Actions>
                            <Button
                                disabled = { superAdminDashboardPageStore.selectedMiningFarmEntities.size === 0 }
                                onClick={superAdminDashboardPageStore.approveMiningFarms}>
                            Approve Selected Farms
                            </Button>
                        </Actions>
                    </div>
                    <Table
                        className={'New Farms'}
                        legend={TABLE_LEGEND}
                        widths={TABLE_WIDTHS}
                        aligns={TABLE_ALINGS}
                        tableState={superAdminDashboardPageStore.miningFarmsTableState}
                        onClickRow = { onClickMiningFarmRow }
                        rows={renderFarmsRows()} />
                </div>
                <QueuedCollections dashboardMode = { true } />
            </ColumnLayout>
            <PageFooter />
        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(SuperAdminDashboardPage));
