import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import S from '../../../core/utilities/Main';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import KycStore from '../../../kyc/presentation/stores/KycStore';

import Svg, { SvgSize } from '../../../core/presentation/components/Svg';
import HeaderWallet from './HeaderWallet';
import Actions from '../../../core/presentation/components/Actions';
import Button from '../../../core/presentation/components/Button';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SvgAuraPoolLogo from '../../../public/assets/vectors/aura-pool-logo.svg';
import '../styles/page-header.css'

type Props = {
    accountSessionStore?: AccountSessionStore,
    walletStore?: WalletStore,
    kycStore?: KycStore,
}

function PageHeader({ accountSessionStore, kycStore, walletStore }: Props) {
    const navigate = useNavigate();
    const location = useLocation();

    function onClickAddress() {
        navigate(AppRoutes.USER_PROFILE);
    }

    function onClickLogo() {
        navigate(AppRoutes.HOME);
    }

    function onClickMarketplace() {
        navigate(AppRoutes.MARKETPLACE);
    }

    function onClickRewardsCalculator() {
        navigate(AppRoutes.REWARDS_CALCULATOR);
    }

    function onClickKyc() {
        navigate(AppRoutes.KYC);
    }

    function onClickAdminPortal() {
        navigate(AppRoutes.HOME);
    }

    async function onClickLogout() {
        await accountSessionStore.logout();
        navigate(AppRoutes.HOME);
    }

    return (
        <header className={'PageHeader FlexRow'}>
            <div className={'LogoHeader FlexRow'}>
                <Svg className={'SVG IconLogoWithText Clickable'} svg={ SvgAuraPoolLogo } onClick = { onClickLogo } />
            </div>

            <div className={'NavCnt FlexRow'}>
                <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.MARKETPLACE)}`} onClick={onClickMarketplace}>Marketplace</div>
                <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.REWARDS_CALCULATOR)}`} onClick={onClickRewardsCalculator}>Rewards Calculator</div>

                { accountSessionStore.isUser() === true && (
                    <div
                        className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.USER_PROFILE)}`}
                        onClick={onClickAddress}>
                        Profile
                    </div>
                ) }

                { accountSessionStore.isAdmin() === true && (
                    <div
                        className={'NavButton B1 SemiBold Clickable'}
                        onClick={onClickAdminPortal}>
                        Farm profile
                    </div>
                ) }

                { accountSessionStore.isLoggedIn() === true && kycStore.isVerified() === false && (
                    <div className = { 'KycNotVerified Bold' } onClick = { onClickKyc } >
                        Not Verified
                        <Svg svg = { ErrorOutlineIcon } className = { 'SvgIcon' } size = { SvgSize.CUSTOM } />
                    </div>
                ) }

                <HeaderWallet />

                { accountSessionStore.isLoggedIn() === true && walletStore.isConnected() === false && (
                    <Actions>
                        <Button onClick={onClickLogout}>Logout</Button>
                    </Actions>
                ) }
            </div>
        </header>
    )
}

export default inject((stores) => stores)(observer(PageHeader));
