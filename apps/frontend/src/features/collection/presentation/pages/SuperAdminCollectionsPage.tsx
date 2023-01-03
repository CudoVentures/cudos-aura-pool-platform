import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react'

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent'
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import QueuedCollections from '../components/QueuedCollections';
import ViewCollectionModal from '../components/ViewCollectionModal';
import ChangePasswordModal from '../../../accounts/presentation/components/ChangePasswordModal';

import '../styles/page-super-admin-collections.css'
import SuperAdminCollectionsPageStore from '../stores/SuperAdminCollectionsPageStore';
import NavRowTabs, { createNavRowTab } from '../../../../core/presentation/components/NavRowTabs';
import ApprovedCollections from '../components/ApprovedCollections';
import RejectedCollections from '../components/RejectedCollections';

type Props = {
    superAdminCollectionsPageStore?: SuperAdminCollectionsPageStore
}

function SuperAdminCollectionsPage({ superAdminCollectionsPageStore }: Props) {

    useEffect(() => {
        superAdminCollectionsPageStore.init();
    }, []);

    return (
        <PageLayoutComponent
            className={'PageSuperAdminCollections'}
            modals={
                <>
                    <ChangePasswordModal />
                    <ViewCollectionModal />
                </>
            } >

            <PageSuperAdminHeader />

            <ColumnLayout className={'PageContent AppContent'} >
                <div className={'Grid GridColumns3'}>
                    <div className={'H2 ExtraBold'}>Collections</div>
                    <div className={'TableTypePickerHolder FlexRow'}>
                        <NavRowTabs className = { 'TableTypePicker' } navTabs={[
                            createNavRowTab('Approved', superAdminCollectionsPageStore.isSelectedTableApproved(), superAdminCollectionsPageStore.onClickShowApproved),
                            createNavRowTab('Pending Approval', superAdminCollectionsPageStore.isSelectedTableQueued(), superAdminCollectionsPageStore.onClickShowQueued),
                            createNavRowTab('Rejected', superAdminCollectionsPageStore.isSelectedTableRejected(), superAdminCollectionsPageStore.onClickShowRejected),
                        ]} />
                    </div>
                    <div></div>
                </div>
                {superAdminCollectionsPageStore.isSelectedTableApproved() && <ApprovedCollections dashboardMode={false} />}
                {superAdminCollectionsPageStore.isSelectedTableQueued() && <QueuedCollections dashboardMode={false} />}
                {superAdminCollectionsPageStore.isSelectedTableRejected() && <RejectedCollections dashboardMode={false} />}
            </ColumnLayout>

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(SuperAdminCollectionsPage));
