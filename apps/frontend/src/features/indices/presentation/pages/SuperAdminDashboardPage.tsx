import React from 'react';
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

type Props = {
}

function SuperAdminDashboardPage({ }: Props) {

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
                <QueuedMiningFarms dashboardMode = { true } />
                <QueuedCollections dashboardMode = { true } />
            </ColumnLayout>
            <PageFooter />
        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(SuperAdminDashboardPage));
