import React from 'react';
import { inject, observer } from 'mobx-react'

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent'
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import ChangePasswordModal from '../../../accounts/presentation/components/ChangePasswordModal';
import ViewMiningFarmModal from '../components/ViewMiningFarmModal';
import QueuedMiningFarms from '../components/QueuedMiningFarms';

import '../styles/page-super-admin-mining-farms.css'

type Props = {
}

function SuperAdminMiningFarmsPage({}: Props) {
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
            <ColumnLayout className={'PageContent AppContent'} >
                <div className={'H1 ExtraBold'}>Farms</div>
                <QueuedMiningFarms dashboardMode = { false } />
            </ColumnLayout>

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(SuperAdminMiningFarmsPage));
