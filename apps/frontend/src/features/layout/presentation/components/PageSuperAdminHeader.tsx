import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import AppRoutes from '../../../app-routes/entities/AppRoutes';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import ChangePasswordModalStore from '../../../accounts/presentation/stores/ChangePasswordModalStore';
import HeaderWallet from './HeaderWallet';
import S from '../../../../core/utilities/Main';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';

import Svg from '../../../../core/presentation/components/Svg';
import Actions from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';

import SvgAuraPoolLogo from '../../../../public/assets/vectors/aura-pool-logo.svg';
import '../styles/page-super-admin-header.css'

type Props = {
    accountSessionStore?: AccountSessionStore;
    changePasswordModalStore?: ChangePasswordModalStore;
    walletStore?: WalletStore;
}

function PageSuperAdminHeader({ accountSessionStore, changePasswordModalStore, walletStore }: Props) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (accountSessionStore.shouldUpdatePassword() === false) {
            return;
        }

        changePasswordModalStore.showSignal(true);
    }, [accountSessionStore.shouldUpdatePassword()]);

    function onClickLogo() {
        navigate(AppRoutes.HOME);
    }

    function onClickAnalytics() {
        navigate(AppRoutes.SUPER_ADMIN_ANALYTICS);
    }

    function onClickMegaWallet() {
        navigate(AppRoutes.SUPER_ADMIN_MEGA_WALLET);
    }

    function onClickCollections() {
        navigate(AppRoutes.SUPER_ADMIN_COLLECTIONS);
    }

    function onClickMiningFarms() {
        navigate(AppRoutes.SUPER_ADMIN_MINING_FARMS);
    }

    async function onClickLogout() {
        await accountSessionStore.logout();
        navigate(AppRoutes.HOME);
    }

    function onClickChangePassword() {
        changePasswordModalStore.showSignal(false);
    }

    return (
        <header className={'PageSuperAdminHeader FlexRow'}>
            <div className={'LogoHeader FlexRow'}>
                <Svg className={'SVG IconLogoWithText Clickable'} svg={ SvgAuraPoolLogo } onClick = { onClickLogo } />
                <div className={'AdminPortalNav B2 SemiBold'}>Super Admin</div>
            </div>
            <div className = { 'NavCnt FlexRow' } >
                <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.SUPER_ADMIN_ANALYTICS)}`} onClick={onClickAnalytics}>Analytics</div>
                <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.SUPER_ADMIN_MEGA_WALLET)}`} onClick={onClickMegaWallet}>Mega Wallet</div>
                <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.SUPER_ADMIN_COLLECTIONS)}`} onClick={onClickCollections}>Collections</div>
                <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.SUPER_ADMIN_MINING_FARMS)}`} onClick={onClickMiningFarms}>Farms</div>
                <HeaderWallet />

                <Actions>
                    <Button onClick={onClickChangePassword}>Change Password</Button>
                    { walletStore.isConnected() === false && (
                        <Button onClick={onClickLogout}>Logout</Button>
                    ) }
                </Actions>
            </div>
        </header>
    )
}

export default inject((stores) => stores)(observer(PageSuperAdminHeader));
