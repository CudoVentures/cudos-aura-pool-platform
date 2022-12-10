import React from 'react';
import { inject, observer } from 'mobx-react'

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent'
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';

import '../styles/page-super-admin-mining-farms.css'

type Props = {
}

function SuperAdminMiningFarmsPage({}: Props) {
    return (
        <PageLayoutComponent className = { 'PageSuperAdminMiningFarms' } >
            <PageSuperAdminHeader />
            <ColumnLayout className={'PageContent AppContent'} >
                <div className={'H1 ExtraBold'}>Farms</div>
            </ColumnLayout>
        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(SuperAdminMiningFarmsPage));
