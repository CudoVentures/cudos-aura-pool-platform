import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import S from '../../../core/utilities/Main';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import PresaleStore from '../../../app-routes/presentation/PresaleStore';

import Svg from '../../../core/presentation/components/Svg';
import HeaderWallet from './HeaderWallet';
import Actions from '../../../core/presentation/components/Actions';
import Button from '../../../core/presentation/components/Button';
import KycBadge from '../../../core/presentation/components/KycBadge';

import SvgAuraPoolLogo from '../../../public/assets/vectors/cudos-markets-logo.svg';
import '../styles/page-header.css'
import { REWARDS_CALCULATOR } from '../../../core/utilities/Links';

type Props = {
    accountSessionStore?: AccountSessionStore,
    walletStore?: WalletStore,
    presaleStore?: PresaleStore,
}

function PageHeader({ accountSessionStore, walletStore, presaleStore }: Props) {
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

    function onClickExploreNfts() {
        navigate(AppRoutes.EXPLORE_NFTS);
    }

    // function onClickRewardsCalculator() {
    //     navigate(AppRoutes.REWARDS_CALCULATOR);
    // }

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
                { presaleStore.isInPresale() === true ? (
                    <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.MARKETPLACE)}`} onClick={onClickMarketplace}> Presale </div>
                ) : (
                    <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.MARKETPLACE)}`} onClick={onClickExploreNfts}> Marketplace </div>
                ) }
                {/* <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.REWARDS_CALCULATOR)}`} onClick={onClickRewardsCalculator}>Rewards Calculator</div> */}
                <a className={'NavButton B1 SemiBold Clickable'} href={REWARDS_CALCULATOR} target='_blank' rel="noreferrer">Rewards Calculator</a>

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

                { accountSessionStore.isUser() === true && (
                    <KycBadge />
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
