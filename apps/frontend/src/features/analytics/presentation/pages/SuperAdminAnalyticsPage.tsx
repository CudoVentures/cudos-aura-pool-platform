import React from 'react';
import { inject, observer } from 'mobx-react'

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent'
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';

import '../styles/page-super-admin-analytics.css'

type Props = {
}

function SuperAdminAnalyticsPage({}: Props) {
    return (
        <PageLayoutComponent className = { 'PageSuperAdminAnalytics' } >
            <PageSuperAdminHeader />
            <ColumnLayout className={'PageContent AppContent'} >
                <div className={'H1 ExtraBold'}>Analytics</div>
            </ColumnLayout>
        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(SuperAdminAnalyticsPage));
