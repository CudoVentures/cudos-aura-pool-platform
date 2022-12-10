import React from 'react';
import { inject, observer } from 'mobx-react'

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent'
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';

import '../styles/page-super-admin-collections.css'

type Props = {
}

function SuperAdminCollectionsPage({}: Props) {
    return (
        <PageLayoutComponent className = { 'PageSuperAdminCollections' } >
            <PageSuperAdminHeader />
            <ColumnLayout className={'PageContent AppContent'} >
                <div className={'H1 ExtraBold'}>Collections</div>
            </ColumnLayout>
        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(SuperAdminCollectionsPage));
