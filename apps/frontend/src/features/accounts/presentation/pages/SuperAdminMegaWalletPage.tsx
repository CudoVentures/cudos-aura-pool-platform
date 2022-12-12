import React from 'react';
import { inject, observer } from 'mobx-react'

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent'
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import ChangePasswordModal from '../components/ChangePasswordModal';

import '../styles/page-super-admin-mega-wallet.css'

type Props = {
}

function SuperAdminMegaWalletPage({}: Props) {
    return (
        <PageLayoutComponent
            className = { 'PageSuperAdminMegaWallet' }
            modals = { (
                <>
                    <ChangePasswordModal />
                </>
            ) } >

            <PageSuperAdminHeader />
            <ColumnLayout className={'PageContent AppContent'} >
                <div className={'H1 ExtraBold'}>Mega Wallet</div>
            </ColumnLayout>

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(SuperAdminMegaWalletPage));
