import React from 'react';
import { inject, observer } from 'mobx-react'

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent'
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import QueuedCollections from '../components/QueuedCollections';
import ViewCollectionModal from '../components/ViewCollectionModal';

import '../styles/page-super-admin-collections.css'

type Props = {
}

function SuperAdminCollectionsPage({}: Props) {
    return (
        <PageLayoutComponent
            className = { 'PageSuperAdminCollections' }
            modals = {
                <>
                    <ViewCollectionModal />
                </>
            } >
            <PageSuperAdminHeader />
            <ColumnLayout className={'PageContent AppContent'} >
                <QueuedCollections dashboardMode = { false } />
            </ColumnLayout>
        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(SuperAdminCollectionsPage));
